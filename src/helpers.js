const dotenv = require('dotenv');
dotenv.config();

var defaultPort = 8080;
var defaultListenIp = "0.0.0.0";
var defaultDbHost = "localhost";
var defaultDbPort = 28015;
var defaultDbName = "ejednani";
var fs = require('fs');
var dateFormat = require('dateformat');

module.exports.getPort = function getPort() {
    return process.env.PORT || defaultPort;
}

module.exports.getListenIp = function getListenIp() {
    return process.env.LISTEN_IP || defaultListenIp;
}
 
module.exports.createdDate = function createdDate (file) {  
    const { birthtime } = fs.statSync(file);
    return dateFormat(birthtime, "dd.mm.yyyy" );
}

module.exports.getDbHost = function getDbHost() {
    return (process.env.DB_HOST || defaultDbHost);
}
module.exports.getDbPort = function getDbPort() {
    return (process.env.DB_PORT || defaultDbPort);
}
module.exports.getDbName = function getDbName() {
    return (process.env.DB_NAME || defaultDbName);
}

module.exports.simpleReadFileSync = function simpleReadFileSync(filePath)
{
    var options = {encoding:'utf-8', flag:'r'};
    return fs.readFileSync(filePath, options);
}