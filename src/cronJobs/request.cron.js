const cron = require("node-cron");
const { format, subDays, startOfDay, endOfDay } = require("date-fns");
const connectionRequestModel = require("../models/connectionRequest");
const { INTERESTED } = require("../utils/common");
const generateFullEmailHTML = require("../emailTemplates/notifyReqReceivers");
const sendSESMail = require("../utils/sendEmail.js");
const timezone = "Asia/Kolkata";

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
    const prevDate = subDays(new Date(), 1);
    const prevDayStart = startOfDay(prevDate);
    const prevDayEnd = endOfDay(prevDate);

    // 2.Fetch for pending connection requests and extract receiver emailIds
    const pendingReqs = await connectionRequestModel
      .find({
        status: INTERESTED,
        createdAt: { $gte: prevDayStart, $lte: prevDayEnd },
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
    console.log(
      `cron notifyRequestReceivers, pendingReqs length : ${pendingReqs?.length}`
    );

    if (pendingReqs.length > 0) {
      // 3.Segreate records based on receiver emailIds using Map data structure
      // eg : Map{emailId : ['userName'...]}
      const usersMap = new Map();
      pendingReqs.forEach(
        ({
          fromUserId: {
            firstName: fromFirstName,
            lastName: fromLastName,
            profileUrl,
          },
          toUserId: { firstName: toFirstName, lastName: toLastName, emailId },
        }) => {
          if (!usersMap.has(emailId)) {
            usersMap.set(emailId, {
              userName: `${toFirstName} ${toLastName}`,
              fromUsers: [
                { name: `${fromFirstName} ${fromLastName}`, profileUrl },
              ],
            });
          } else {
            const tarItemValue = usersMap.get(emailId);
            usersMap.set(emailId, {
              ...tarItemValue,
              fromUsers: [
                ...tarItemValue?.fromUsers,
                { name: `${fromFirstName} ${fromLastName}`, profileUrl },
              ],
            });
          }
        }
      );
      for (const [key, { userName, fromUsers }] of usersMap) {
        try {
          const mailBody = await generateFullEmailHTML(
            process.env.EMAIL_RECEIVER_USER_NAME,
            userName || "",
            fromUsers
          );
          const mailSendRes = await sendSESMail.run(
            process.env.RECEIVER_EMAIL_ID,
            "New Connection Requests",
            mailBody
          );
          console.log(
            "cron notifyRequestReceivers, AWS SES EMAIL SEND RESPONSE : ",
            JSON.stringify(mailSendRes)
          );
        } catch (err) {
          console.log(
            `cron notifyRequestReceivers, error : ${JSON.stringify(err)}, ${
              err?.message
            }`
          );
        }
      }
    }
  },
  {
    timezone,
  }
);

module.exports = [notifyRequestReceivers];
