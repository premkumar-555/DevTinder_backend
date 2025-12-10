const { format } = require("date-fns");
const cron = require("node-cron");
const allCronJobs = [...require("./request.cron")];

// 1.Before initiating tasks, clear all previous cron jobs if preset
if (cron.getTasks()?.length > 0) {
  cron.getTasks().forEach((task) => {
    task?.destroy();
  });
  console.log(
    `Cleared all cron jobs @ : ${format(new Date(), "dd/MM/yyyy hh:mmaa")}`
  );
}

// 2.Starting all scheduled cron jobs
if (allCronJobs?.length > 0) {
  allCronJobs.forEach((task) => task.start());
  console.log(
    `Started all cron jobs @ : ${format(new Date(), "dd/MM/yyyy hh:mmaa")}`
  );
}
