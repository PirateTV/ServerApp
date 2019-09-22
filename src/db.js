var helpers = require("./helpers.js");

var rdb = require('rethinkdbdash')({
  host: helpers.getDbHost(),
  port: helpers.getDbPort(),
  db: helpers.getDbName(),
});
module.exports.rdb = rdb;