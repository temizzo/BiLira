function logMessage(message) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), message }, null, 2));
}

module.exports = { logMessage };