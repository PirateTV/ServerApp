var express = require('express');
var auth = require("./auth.js");
var router = express.Router();
var helpers = require("./helpers.js");
var i18n = require("i18n");
var ejs = require('ejs');
var fs = require('fs');
var log = require('./log.js');
var db = require('./db.js'); 

// Dynamic endpoints
router.get("/", auth.isAuthorized, function(req, res) {
    res.redirect("/tajemstvi/login");
});

router.get("/auth/:token", auth.isAuthorized, function(req, res) {
    res.redirect("/tajemstvi/login");
});

router.get("/login", auth.isAuthorized, function(req, res) {
    res.redirect("/tajemstvi/events");
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

router.get("/events", auth.isAuthorized, function(req, res, next) {
    // select all user's events
    db.rdb.table("events").filter((req.session.type == "administrator") ? {} : {"author":req.session.userId}).orderBy("eventStart").run().then(function(onAirShows) {
        res.render("admin_events", {
            SubpageTitle: i18n.__('AdminLiveStreams'),
            SubpageDescription: i18n.__('GlobalSiteDescription'),
            SubpageCover: "https://piratskatelevize.cz/images/icon.png",
            SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            OnAirShows: onAirShows,
            SanitizeStringToUrl: function(str) {
                return helpers.sanitizeStringToUrl(str);
            }
        });
    });
});

router.get("/events/:eventId", auth.isAuthorized, function(req, res, next) {
    if(req.params.eventId == "createNew") {
        res.render("admin_eventUpdate", {
            SubpageTitle: i18n.__('AdminLiveStreams'),
            EventAction: i18n.__('EventCreateNew'),
            SubpageDescription: i18n.__('GlobalSiteDescription'),
            SubpageCover: "https://piratskatelevize.cz/images/icon.png",
            SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            OnAirShow: {},
            SanitizeStringToUrl: function(str) {
                return helpers.sanitizeStringToUrl(str);
            }
        });
    }
    else {
        // select event by Id and check if it belongs to the author
        db.rdb.table("events").filter((req.session.type == "administrator") ? {"id":req.params.eventId} : {"id":req.params.eventId, "author":req.session.userId}).run().then(function(onAirShows) {
            res.render("admin_eventUpdate", {
                SubpageTitle: i18n.__('AdminLiveStreams'),
                EventAction: i18n.__('EventEdit'),
                SubpageDescription: i18n.__('GlobalSiteDescription'),
                SubpageCover: "https://piratskatelevize.cz/images/icon.png",
                SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                OnAirShow: onAirShows[0],
                SanitizeStringToUrl: function(str) {
                    return helpers.sanitizeStringToUrl(str);
                }
            });
        });
    }
});

router.post("/events/:eventId", auth.isAuthorized, function(req, res, next) {
    if (
        req.body.eventTitle != "" &&
        req.body.eventStartDate != "" &&
        req.body.eventStartTime != ""
    ) {
        if(req.params.eventId == "createNew") {
            // select event by Id and check if it belongs to the author
            db.rdb.table("events").insert({
                "title":req.body.eventTitle,
                "cover":req.body.eventCoverUrl,
                "eventStart":new Date(req.body.eventStartDate + " " + req.body.eventStartTime),
                "youtube":req.body.eventYoutubeUrl,
                "slido":req.body.eventSlidoUrl,
                "onAir":(req.body.eventOnAir == "checked" ? true : false),
                "author":req.session.userId
            }).run().then(function() {
                res.redirect("/tajemstvi/events");
            });
        }
        else {
            // select event by Id and check if it belongs to the author
            db.rdb.table("events").filter((req.session.type == "administrator") ? {"id":req.params.eventId} : {"id":req.params.eventId, "author":req.session.userId}).update({
                "title":req.body.eventTitle,
                "cover":req.body.eventCoverUrl,
                "eventStart":new Date(req.body.eventStartDate + " " + req.body.eventStartTime),
                "youtube":req.body.eventYoutubeUrl,
                "slido":req.body.eventSlidoUrl,
                "onAir":(req.body.eventOnAir == "checked" ? true : false),
                "author":req.session.userId
            }).run().then(function() {
                res.redirect("/tajemstvi/events/" + req.params.eventId);
            });
        }
    }
});

router.get("/events/:eventId/delete", auth.isAuthorized, function(req, res, next) {
    // select event by Id and check if it belongs to the author
    db.rdb.table("events").filter((req.session.type == "administrator") ? {"id":req.params.eventId} : {"id":req.params.eventId, "author":req.session.userId}).delete().run().then(function() {
        res.redirect("/tajemstvi/events");
    });
});

module.exports = router;