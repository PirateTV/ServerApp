var express = require('express');
var router = express.Router();
var i18n = require("i18n");
var db = require('./db.js'); 
var Feed = require('rss-to-json');
var request = require("request");
var EventEmitter = require("events").EventEmitter;
var parser = require('xml2js').Parser({ attrkey: "ATTR" });
var getThumb = require('video-thumbnail-url');
var geoip = require('geoip-lite');
const urlMetadata = require('url-metadata');
var helpers = require("./helpers.js");
var log = require('./log.js');

async function getUrlPreview(url) {
    return (
        await urlMetadata(url).then(
            function (metadata) { // success handler
                return metadata['og:image'];
            },
            function (error) { // failure handler
                console.log(error);
                return undefined;
    }));            
};

// Dynamic endpoints
router.get("/", function(req, res) {
    saveClientLog(req);

    res.redirect("/zive/");
});


router.get("/pocasi", function(req, res) {
    saveClientLog(req);

    res.render("weather", {
        SubpageTitle: i18n.__('Weather'),
        SubpageDescription: i18n.__('GlobalSiteDescription'),
        SubpageCover: "https://piratskatelevize.cz/images/icon.png",
        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    });
});

router.get("/o-nas", function(req, res) {
    saveClientLog(req);

    db.rdb.table("shows").filter({"category":"show"}).orderBy("title").run().then(function(shows) {
        var feeds = [["Pirátské listy - články", "https://www.piratskelisty.cz/rss/"], ["Pirátské listy - aktuality","https://www.piratskelisty.cz/rss/aktuality"], ["Public Domain Movies", "http://publicdomainmovies.net/"]];
        for(var i=0; i<shows.length; i++) {
            feeds.push([shows[i].title, getYoutubeFeed(shows[i].youtube)]);
        }

        res.render("about", {
            SubpageTitle: i18n.__('About'),
            SubpageDescription: i18n.__('GlobalSiteDescription'),
            SubpageCover: "https://piratskatelevize.cz/images/icon.png",
            SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            Feeds: feeds,
        });
    });
});

router.get("/404", function(req, res) {
    saveClientLog(req);

    res.render("404", {
        SubpageTitle: i18n.__('404-NotFound'),
        SubpageDescription: i18n.__('GlobalSiteDescription'),
        SubpageCover: "https://piratskatelevize.cz/images/icon.png",
        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
    });
});

router.get("/zive", function(req, res) {
    saveClientLog(req);

    // select all events one day old max and onAir
    db.rdb.table("events").filter(db.rdb.row("onAir").eq(true).and(db.rdb.row("eventStart").ge(db.rdb.now().sub(24*60*60)))).orderBy("eventStart").run().then(function(onAirShows) {
        // select all upcoming events not onAir
        db.rdb.table("events").filter(db.rdb.row("onAir").eq(false).and(db.rdb.row("eventStart").ge(db.rdb.now().sub(60*60)))).orderBy("eventStart").run().then(function(upcomingShows) {
            res.render("events", {
                SubpageTitle: i18n.__('LiveStreams'),
                SubpageDescription: i18n.__('GlobalSiteDescription'),
                SubpageCover: "https://piratskatelevize.cz/images/icon.png",
                SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                OnAirShows: onAirShows,
                UpcomingShows: upcomingShows,
                SanitizeStringToUrl: function(str) {
                    return helpers.sanitizeStringToUrl(str);
                }
            });
        });
    });
});


router.get("/zive/:eventTitle", function(req, res) {
    res.redirect("/zive/" + req.params.eventTitle + "/event");
});

router.get("/zive/:eventTitle/:eventId", function(req, res) {
    saveClientLog(req);

    db.rdb.table("events").orderBy("eventStartDate").run().then(function(shows) {
        show = shows.find(function(elem) {
            if(req.params.eventId == "event") {
                return (helpers.sanitizeStringToUrl(elem.title) == helpers.sanitizeStringToUrl(req.params.eventTitle));
            }
            else {
                return (helpers.sanitizeStringToUrl(elem.title) == helpers.sanitizeStringToUrl(req.params.eventTitle) && elem.id == req.params.eventId);
            }
            
        });
        if(show == null || show.length <= 0) {
            res.redirect("/404");
        }
        else {
            var views = 1;
            if(show.views != null) {
                views = show.views + 1;
            }
            db.rdb.table("events").get(show.id).update({"views": views}).run();

            db.rdb.table("users").get(show.author).run().then(function(author) {
                res.render("eventDetail", {
                    SubpageTitle: show.title,
                    SubpageDescription: i18n.__('GlobalSiteDescription'),
                    SubpageCover: (show.cover == "") ? "https://piratskatelevize.cz/images/icon.png" : show.cover,
                    SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                    ShowDetails: show,
                    EventAuthor: author
                });
            });
        }
    });
});

function formatDateTimeToCZ(datetimeStr) {
    var datum = new Date(datetimeStr);
    var den = datum.getDate();
    var mesic = datum.getMonth()+1;
    var rok = datum.getFullYear();
    var hodiny = datum.getHours();
    var minuty = datum.getMinutes();
    return den + ". " + mesic + ". " + rok;
}

function getYoutubeFeed(youtubeUrl) {
    // https://www.youtube.com/feeds/videos.xml?channel_id=UCcf12G_5igxOSZBFSt4eEAQ  |  https://www.youtube.com/channel/UCcf12G_5igxOSZBFSt4eEAQ/videos
    // https://www.youtube.com/feeds/videos.xml?playlist_id=PLKqQxo2sZ8NfKKow6zTMyVZF7jfzpIMw9  |  https://www.youtube.com/playlist?list=PLKqQxo2sZ8NfKKow6zTMyVZF7jfzpIMw9
    var feed = "";
    var isChannel = youtubeUrl.includes("channel/");

    if(isChannel) {
        var youtubeId = youtubeUrl.substr(youtubeUrl.indexOf("channel/") + 8).replace("/videos", "");
        feed = "https://www.youtube.com/feeds/videos.xml?channel_id=" + youtubeId;
    }
    else {
        var youtubeId = youtubeUrl.substr(youtubeUrl.indexOf("playlist?list=") + 14);
        feed = "https://www.youtube.com/feeds/videos.xml?playlist_id=" + youtubeId;
    }

    return feed;
}

function saveClientLog(req) {
    var geo = geoip.lookup(req.headers['x-real-ip']);
    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = ("0" + date_ob.getHours()).slice(-2);
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    
    db.rdb.table("clientLog").insert({
        "DateTime" : year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
        "ClientIP": req.headers['x-real-ip'],
        "RequestUrl" : req.protocol + '://' + req.get('host') + req.originalUrl,
        "Country" : (geo ? geo.country: "Unknown"),
        "Region" : (geo ? geo.city: "Unknown"),
        "Browser" : req.headers["user-agent"],
        "Language" : req.headers["accept-language"]
    }).run();
}

function videoIdFromYtLink(url) {
    VID_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/; 
    return url.match(VID_REGEX)[1]; 
}

function showEpisode(req, res, renderPage = "showDetail") {
    saveClientLog(req);

    db.rdb.table("shows").filter({"category":"show"}).orderBy("title").run().then(function(shows) {
        show = shows.find(function(elem) {
            return helpers.sanitizeStringToUrl(elem.title) == helpers.sanitizeStringToUrl(req.params.showTitle);
        });
        if(show == null || show.length <= 0) {
            res.redirect("/404");
        }
        else {
            // Update "views" counter by adding 1
            var views = 1;
            if(show.views != null) {
                views = show.views + 1;
            }
            db.rdb.table("shows").get(show.id).update({"views": views}).run();

            // Get YouTube feed link
            var feed = getYoutubeFeed(show.youtube);

            // Get YouTube XML and parse it to JSON
            var body = new EventEmitter();
            request(feed, function(error, response, data) {
                parser.parseString(data, function(error, result) {
                    body.data = result;
                    body.emit('update');
                });
            });

            // Feed request is async, so when emitter is updated, render the page
            body.on('update', function () {
                // Find if episode is specified. If not, return latest episode.
                var x = function() {
                    if(req.params.showEpisode == null || req.params.showEpisode == "" || req.params.showEpisode == "nejnovejsi") {
                        return body.data.feed.entry[0];
                    }
                    // If yes, check if it exists. If yes, return it. If not return -1.
                    else {
                        var result = body.data.feed.entry.filter(function(elem) {
                            return helpers.sanitizeStringToUrl(elem.title) == helpers.sanitizeStringToUrl(req.params.showEpisode);
                        });
                        if(result.length > 0) {
                            return result[0];
                        }
                        else {
                            return -1;
                        }
                    }
                };

                // If episode doesnt exist, return 404 page
                if(x() == -1) {
                    res.redirect("/404");
                }
                else {
                    res.render(renderPage, {
                        SubpageTitle: show.title,
                        SubpageDescription: (x()['media:group'][0]['media:description'][0].slice(0, 160) + "(...)").replace(/(<([^>]+)>)/gi, ""),
                        SubpageCover: x()['media:group'][0]['media:thumbnail'][0].ATTR.url,
                        SubpageUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                        ShowDetails: show,
                        ShowYoutubeVideoId: x()['yt:videoId'],
                        Rss: body.data.feed.entry,
                        GetThumb: function(item) {
                            return item['media:group'][0]['media:thumbnail'][0].ATTR.url;
                        },
                        GetDescription: function(item) {
                            return item['media:group'][0]['media:description'][0];
                        },
                        FormatDateTimeToCZ: function(str) {
                            return formatDateTimeToCZ(str);
                        },
                        Episode: function() {
                            return x();
                        },
                        SanitizeStringToUrl: function(str) {
                            return helpers.sanitizeStringToUrl(str);
                        }
                    });
                }
            });
        }
    });
}
module.exports = router;