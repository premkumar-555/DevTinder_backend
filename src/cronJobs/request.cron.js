const cron = require("node-cron");
const { format, subDays, startOfDay, endOfDay } = require("date-fns");
const { Queue, Worker, QueueEvents } = require("bullmq");
const IORedis = require("ioredis");
const connectionRequestModel = require("../models/connectionRequest");
const { INTERESTED } = require("../utils/common");
const generateFullEmailHTML = require("../emailTemplates/notifyReqReceivers");
const sendSESMail = require("../utils/sendEmail.js");
const timezone = "Asia/Kolkata";
const EMAIL_QUEUE = "emailQueue";
const connection = new IORedis({
  maxRetriesPerRequest: null,
});

// Global emailQueue to process bulk email sending
// then will add jobs to it in each cron job iteration
const emailQueue = new Queue(EMAIL_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "fixed",
      delay: 1000,
    },
  },
});

// Global worker to subscribe emailQueue & process queue jobs
listenEmailQueue();

// cron job to execute at 8AM daily to send mail notifications to
// users who received connection requests previous day
const notifyRequestReceivers = cron.createTask(
  "0 8 * * *",
  async (ctx) => {
    console.log(
      `cron notifyRequestReceivers, triggeredAt : ${format(
        ctx.triggeredAt,
        "dd/MM/yyyy hh:mmaa"
      )}`
    );
    // 1.Prepare time intervals, prevDayStart --> prevDayEnd
    const dateRange = getDatesNdaysBack(1);
    // 2.Fetch for pending connection requests and extract receiver emailIds
    const pendingReqs = await fetchConnectionReqs(INTERESTED, dateRange);
    console.log(
      `cron notifyRequestReceivers, pendingReqs length : ${pendingReqs?.length}`
    );
    if (pendingReqs.length > 0) {
      // 3.Segreate records based on receiver emailIds using Map data structure
      const usersMap = groupByReceiverEmailId(pendingReqs);
      // 4.Process emailing using message queue
      // a) add jobs to emailQueue
      await addJobsToQueue(emailQueue, usersMap);
    }
  },
  {
    timezone,
  }
);

// To get start and end dates of a day back n days from current day
const getDatesNdaysBack = (n) => {
  const prevDate = subDays(new Date(), n);
  return { startDate: startOfDay(prevDate), endDate: endOfDay(prevDate) };
};

// To fetch connection requests for specified status
// and between specified date ranges
const fetchConnectionReqs = async (reqStatus, dateRange) => {
  const pendingReqs = await connectionRequestModel
    .find({
      status: reqStatus,
      createdAt: { $gte: dateRange?.startDate, $lte: dateRange?.endDate },
    })
    .select(["fromUserId", "toUserId"])
    .populate({
      path: "toUserId",
      select: ["firstName", "lastName", "emailId"],
    })
    .populate({
      path: "fromUserId",
      select: ["firstName", "lastName", "profileUrl"],
    });
  return pendingReqs;
};

// To group records based on receiver emailIds
// returns a map, eg: Map{emailId : {userName : 'abc', fromUsers : ['fromUserA', ...]}}
const groupByReceiverEmailId = (requests) => {
  const usersMap = new Map();
  requests.forEach(
    ({
      fromUserId: {
        firstName: fromFirstName,
        lastName: fromLastName,
        profileUrl,
      },
      toUserId: { firstName: toFirstName, lastName: toLastName, emailId },
    }) => {
      const value = {
        userName: `${toFirstName} ${toLastName}`,
        fromUsers: !usersMap.has(emailId)
          ? [{ name: `${fromFirstName} ${fromLastName}`, profileUrl }]
          : [
              ...usersMap.get(emailId)?.fromUsers,
              { name: `${fromFirstName} ${fromLastName}`, profileUrl },
            ],
      };
      usersMap.set(emailId, value);
    }
  );
  return usersMap;
};

// To add jobs to specified queue
// params : queue => bullMQ queue, jobs =>
const addJobsToQueue = async (queue, jobs) => {
  if (queue && jobs.size > 0) {
    for (const [key, value] of jobs) {
      await queue.add("sendEmail", value);
    }
  }
};

// To process jobs at emails Queue
async function listenEmailQueue() {
  const worker = new Worker(
    EMAIL_QUEUE,
    async (job) => {
      // prepare email
      const { userName, fromUsers } = job?.data;
      const mailBody = generateFullEmailHTML(
        process.env.EMAIL_RECEIVER_USER_NAME,
        userName || "",
        fromUsers
      );
      await sendSESMail.run(
        process.env.RECEIVER_EMAIL_ID,
        "New Connection Requests",
        mailBody
      );
    },
    {
      connection,
      concurrency: 10,
    }
  );
  worker.on("failed", (job, err) => {
    console.log(
      `${job?.data?.userName || job?.data?.id} has failed with ${err.message}`,
      job
    );
  });
  const events = new QueueEvents(EMAIL_QUEUE);
  events.on("drained", () => {
    console.log("🎉 EMAIL_QUEUE is finished (no pending jobs)");
  });
}

module.exports = [notifyRequestReceivers];
