var log = require('./log.js');
var helpers = require("./helpers.js");
var db = require('./db.js');
var util = require('util');
var i18n = require("i18n");

module.exports = {
  isAuthorized: function(req, res, next) {
    // Check existing user session
    if (req.session && req.session.userId) {
      // Extend session expiration
      req.session.cookie.expires = new Date(Date.now() + (3600 * 1000)); // 1 hour
      return next();
    }
    else {
      var accessToken = req.params.token;

      // Do user authorization (db, oauth, etc.)
      // Create user session after login
     
      if(accessToken) {
        db.rdb.table("users").filter(db.rdb.row("accessToken").eq(accessToken)).run().then(function(results) {
          
          if (results && results[0] !== undefined && (results[0]['accessToken'] == accessToken)) {
            
            var sess = req.session;

            sess.email = results[0]['email'];
            sess.userId = results[0]['id'];
            sess.avatar = results[0]['avatar'];
            sess.fullname = results[0]['fullname'];
            sess.type = results[0]['type'];
            sess.cookie.expires = new Date(Date.now() + (3600 * 1000)); // 1 hour
            sess.cookie.maxAge = 86400 * 1000; // 1 day
            
            log.log("User '" + sess.email + "' logged in");

            // delete access token in db
            db.rdb.table("users").filter(db.rdb.row("email").eq(sess.email)).update({
              "accessToken": ""
            }).run();

            /* Redirect to the requested site before login redirect 
            * (based on hidden input type prefiled by server,
            * useful in situation when user is logged out due to the expired session)
            */
            var urlToRedirect = (req.body.urlToRedirect != "/logout") ? req.body.urlToRedirect : "/eje";
            return res.redirect(urlToRedirect);
          }
          else {
            helpers.renderLoginFailed(req, res);
          }
        })
      }
      else {
        helpers.renderLoginFailed(req, res);
      }
    }       
  },

  createToken: function(req, res, next) {
    // Check existing user session
    if (req.session && req.session.userId) {
      return next();
    }
    else {
      var email = req.body.email;

      // generate unique access token
      db.rdb.uuid().run().then(function(accessToken) {

        // Check that user exists
        db.rdb.table("users").filter(db.rdb.row("email").eq(email)).run().then(function(userDetails) {
          if (userDetails && userDetails[0] !== undefined) {
            // update access token in db
            db.rdb.table("users").filter(db.rdb.row("email").eq(email)).update({
              "accessToken": accessToken
            }).run();

            // send mail with access token
            var linkWithToken = req.protocol + '://' + req.get('host') + req.originalUrl + "/" + accessToken;
            helpers.sendMail(email, i18n.__('AccessTokenMailSubject'), util.format(i18n.__('AccessTokenMailTextTemplate'), linkWithToken));
          }
          /*else {
            // register new user
            db.rdb.table("users").insert({
              "accessToken": accessToken,
              "fullname": "",
              "email": email,
              "avatar": "",
              "type": "user"
            }).run();
          }*/

          // send mail with access token
          // commented due to blocked registration of new users - moved to IF where user exist
          /*var linkWithToken = req.protocol + '://' + req.get('host') + req.originalUrl + "/" + accessToken;
          helpers.sendMail(email, i18n.__('AccessTokenMailSubject'), util.format(i18n.__('AccessTokenMailTextTemplate'), linkWithToken));*/
        });
      });
    }
  }
}