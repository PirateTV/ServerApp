var dateFormat = require('dateformat');

module.exports.log = function log(message) {
    var now = dateFormat(new Date(Date.now()), "yyyy/mm/dd HH:MM:ss" );
    console.log(now + " " + message);
}