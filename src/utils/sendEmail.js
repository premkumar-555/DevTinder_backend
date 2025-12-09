// snippet-start:[ses.JavaScript.email.sendEmailV3]
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (
  toAddress,
  fromAddress,
  mailSubject,
  mailBody
) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: mailBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: "",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: mailSubject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

const run = async (toAddress, mailSubject, mailBody) => {
  const sendEmailCommand = createSendEmailCommand(
    toAddress,
    process.env.SES_MAIL_ORIGIN,
    mailSubject,
    mailBody
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      /** @type { import('@aws-sdk/client-ses').MessageRejected} */
      const messageRejectedError = caught;
      return messageRejectedError;
    }
    throw caught;
  }
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
module.exports = { run };
