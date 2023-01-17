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
router.get("/", function(req, res) {
    res.redirect("/teletext/100/1");
});

router.get("/:teletextPage", function(req, res) {
    res.redirect("/teletext/" + req.params.teletextPage + "/1");
});

router.get("/:teletextPage/:teletextSubpage", function(req, res) {
    switch(req.params.teletextPage) {
        case "100":
            switch(req.params.teletextSubpage) {
                case "1":
                default:
                    res.render("teletext", {
                        SubpageTitle: i18n.__('Teletext'),
                        SubpageDescription: i18n.__('GlobalSiteDescription'),
                        SubpageCover: "https://piratskatelevize.cz/images/icon.png",
                        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                        TeletextPageNumber: req.params.teletextPage,
                        TeletextSubpageNumber: req.params.teletextSubpage,
                    });
                    break;
                }
            break;
        case "404":
            switch(req.params.teletextSubpage) {
                default:
                    res.render("teletext", {
                        SubpageTitle: i18n.__('Teletext'),
                        SubpageDescription: i18n.__('GlobalSiteDescription'),
                        SubpageCover: "https://piratskatelevize.cz/images/icon.png",
                        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                        TeletextPageNumber: "404",
                        TeletextSubpageNumber: "1",
                    });
                    break;
                }
            break;
        default:
            res.redirect("/teletext/404/1");
    }
});

module.exports = router;