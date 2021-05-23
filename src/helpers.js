const dotenv = require('dotenv');
dotenv.config();

var i18n = require("i18n");
var nodemailer = require('nodemailer'); 

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

module.exports.renderLoginFailed = function renderLoginFailed(req, res, customMessage = "") {
    // If login failed, render login page with specified message
    var message = "";
    var messageType = "";
    
    if(customMessage == "") {
        if(req.originalUrl != "/") {
        message = i18n.__('NonAuthorizedAccess');
        messageType = "error";
        }
        if(req.originalUrl == "/auth") {
        message = i18n.__('WrongUsernameOrPassword');
        messageType = "error";
        }
    }
    else {
        message = customMessage;
        messageType = "error";
    }

    return this.renderLoginPage(req, res, message, messageType);
};

module.exports.renderLoginPage = function renderLoginPage(req, res, message, messageType) {
    return res.render("login", {
        SubpageTitle: i18n.__('Login'),
        SubpageDescription: "",
        SubpageCover: "",
        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
        Email: i18n.__('Email'),
        LoginSubmit: i18n.__('LoginSubmit'),
        loggedOutMessage: message,
        loggedOutMessageType: messageType,
    });
}

module.exports.sendMail = function sendMail(to, subject, text) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAILACCOUNT,
          pass: process.env.GMAILPASSWORD
        }
      });
      
      var mailOptions = {
        from: process.env.GMAILACCOUNT,
        to: to,
        subject: subject,
        text: text
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 
}