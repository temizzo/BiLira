function logMessage(message) {
  console.log(JSON.stringify(message, null, 2));  // Log message in JSON format
}

module.exports = { logMessage };
