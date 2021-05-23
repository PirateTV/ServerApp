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
            LoggedUser: req.session.fullname,
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
            LoggedUser: req.session.fullname,
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
                LoggedUser: req.session.fullname,
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


router.get("/movies", auth.isAuthorized, function(req, res, next) {
    // select all user's events
    db.rdb.table("shows").filter((req.session.type == "administrator") ? {"category":"movie"} : {"author":req.session.userId, "category":"movie"}).orderBy("eventStart").run().then(function(movies) {
        res.render("admin_movies", {
            SubpageTitle: i18n.__('AdminMovies'),
            SubpageDescription: i18n.__('GlobalSiteDescription'),
            SubpageCover: "https://piratskatelevize.cz/images/icon.png",
            SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            Movies: movies,
            LoggedUser: req.session.fullname,
            SanitizeStringToUrl: function(str) {
                return helpers.sanitizeStringToUrl(str);
            }
        });
    });
});

router.get("/movies/:movieId", auth.isAuthorized, function(req, res, next) {
    db.rdb.table("shows").filter({"category":"movie"}).pluck('genre').concatMap(function(hero) {
        return hero('genre')
    }).distinct().run().then(function(genres) {
        if(req.params.movieId == "createNew") {
            res.render("admin_movieUpdate", {
                SubpageTitle: i18n.__('AdminMovies'),
                EventAction: i18n.__('MovieCreateNew'),
                SubpageDescription: i18n.__('GlobalSiteDescription'),
                SubpageCover: "https://piratskatelevize.cz/images/icon.png",
                SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                Movie: {},
                Genres: genres,
                LoggedUser: req.session.fullname,
                SanitizeStringToUrl: function(str) {
                    return helpers.sanitizeStringToUrl(str);
                }
            });
        }
        else {
            // select event by Id and check if it belongs to the author
            db.rdb.table("shows").filter((req.session.type == "administrator") ? {"id":req.params.movieId, "category":"movie"} : {"id":req.params.movieId, "author":req.session.userId, "category":"movie"}).run().then(function(movie) {
                res.render("admin_movieUpdate", {
                    SubpageTitle: i18n.__('AdminMovies'),
                    EventAction: i18n.__('MovieEdit'),
                    SubpageDescription: i18n.__('GlobalSiteDescription'),
                    SubpageCover: "https://piratskatelevize.cz/images/icon.png",
                    SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                    Movie: movie[0],
                    Genres: genres,
                    LoggedUser: req.session.fullname,
                    SanitizeStringToUrl: function(str) {
                        return helpers.sanitizeStringToUrl(str);
                    }
                });
            });
        }
    });
});

router.post("/movies/:movieId", auth.isAuthorized, function(req, res, next) {
    if (
        req.body.movieTitle != "" &&
        (req.body.movieYoutubeUrl != "" ||
        req.body.movieVideoUrl != "") &&
        req.body.movieDescription != "" &&
        req.body.movieGenre != "" &&
        req.body.movieAuthor != "" &&
        req.body.movieLicense != ""

    ) {
        if(req.params.movieId == "createNew") {
            // select event by Id and check if it belongs to the author
            db.rdb.table("shows").insert({
                "author": req.body.movieAuthor,
                "authorUrl": req.body.movieAuthorUrl,
                "category": "movie" ,
                "cover": req.body.movieCoverUrl ,
                "description": req.body.movieDescription,
                "genre": req.body.movieGenre.split(','),
                "license": req.body.movieLicense ,
                "licenseUrl": req.body.movieLicenseUrl,
                "title": req.body.movieTitle,
                "url": req.body.movieUrl,
                "youtube": req.body.movieYoutubeUrl,
                "video": req.body.movieVideoUrl,
                "views": 0
            }).run().then(function() {
                res.redirect("/tajemstvi/movies");
            });
        }
        else {
            // select event by Id and check if it belongs to the author
            db.rdb.table("shows").filter((req.session.type == "administrator") ? {"id":req.params.movieId} : {"id":req.params.movieId, "author":req.session.userId}).update({
                "author": req.body.movieAuthor,
                "authorUrl": req.body.movieAuthorUrl,
                "cover": req.body.movieCoverUrl ,
                "description": req.body.movieDescription,
                "genre": req.body.movieGenre.split(','),
                "license": req.body.movieLicense ,
                "licenseUrl": req.body.movieLicenseUrl,
                "title": req.body.movieTitle,
                "url": req.body.movieUrl,
                "youtube": req.body.movieYoutubeUrl,
                "video": req.body.movieVideoUrl

            }).run().then(function() {
                res.redirect("/tajemstvi/movies/" + req.params.movieId);
            });
        }
    }
});

router.get("/movies/:movieId/delete", auth.isAuthorized, function(req, res, next) {
    // select movie by Id and check if it belongs to the author
    db.rdb.table("shows").filter({}).filter((req.session.type == "administrator") ? {"id":req.params.movieId, "category":"movie"} : {"id":req.params.movieId, "author":req.session.userId, "category":"movie"}).delete().run().then(function() {
        res.redirect("/tajemstvi/movies");
    });
});

module.exports = router;