require("dotenv").config();
const { default: cleanupSessions } = require("./tasks/cleanup-sessions");

cleanupSessions();

export {};
