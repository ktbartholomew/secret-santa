require("dotenv").config();
const { default: cleanupSessions } = require("./tasks/cleanup-sessions");
const { default: batchSendSMS } = require("./tasks/send-sms");

cleanupSessions();
batchSendSMS();

export {};
