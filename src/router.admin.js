var express = require('express');
var auth = require("./auth.js");
var router = express.Router();
var helpers = require("./helpers.js");
var i18n = require("i18n");
var ejs = require('ejs');
var fs = require('fs');
var log = require('./log.js');

// Dynamic endpoints
router.get("/", auth.isAuthorized, function(req, res) {
    res.redirect("/tajemstvi/login");
});

router.get("/auth/:token", auth.isAuthorized, function(req, res) {
    res.redirect("/tajemstvi/login");
});

router.get("/login", auth.isAuthorized, function(req, res) {
    res.redirect("/tajemstvi/dashboard");
});

//send authentication url via e-mail
router.post("/auth", function(req, res, next) {
    auth.createToken(req, res, next);
    helpers.renderLoginPage(req, res, i18n.__('AuthSentMessage'), "success");
});

router.get("/logout", auth.isAuthorized, function(req, res, next) {
if (req.session) {
    log.log("User '" + req.session.email + "' logged out");
    // delete session object
    req.session.destroy(function(err) {
    if(err) {
        return next(err);
    } else {
        helpers.renderLoginPage(req, res, i18n.__('LoggedOutMessage'), "success");
    }
    });
}
});

router.get("/dashboard", auth.isAuthorized, function(req, res, next) {
    res.render("admin_dashboard", {
        SubpageTitle: i18n.__('AdminLiveStreams'),
        SubpageDescription: i18n.__('GlobalSiteDescription'),
        SubpageCover: "https://piratskatelevize.cz/images/icon.png",
        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    });
});

module.exports = router;