function logMessage(message) {
  console.log(JSON.stringify(message, null, 2));
}

module.exports = { logMessage };
