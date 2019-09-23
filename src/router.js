var express = require('express');
var router = express.Router();
var i18n = require("i18n");
var db = require('./db.js'); 
var Feed = require('rss-to-json');
var request = require("request");
var EventEmitter = require("events").EventEmitter;
var parser = require('xml2js').Parser({ attrkey: "ATTR" });
var getThumb = require('video-thumbnail-url');

// Dynamic endpoints
router.get("/", function(req, res) {
    // Load most viewed shows
    db.rdb.table("shows").filter({"category":"show"}).orderBy(db.rdb.desc("views")).run().then(function(shows) {
        // Load topics from news
        Feed.load('https://www.piratskelisty.cz/rss/', function(err, rss) {
            res.render("home", {
                SubpageTitle: i18n.__('Home'),
                RssTopics: rss.items.sort(function(a, b) {
                    // Turn your strings into dates, and then subtract them
                    // to get a value that is either negative, positive, or zero.
                    return new Date(b.pubDate) - new Date(a.pubDate);
                }).slice(0,6),
                FormatDateTimeToCZ: function(str) {
                    return formatDateTimeToCZ(str);
                },
                MostWatchedShows: shows.slice(0,4)
            });
        });
    });
});

router.get("/porady", function(req, res) {
    db.rdb.table("shows").filter({"category":"show"}).orderBy("title").run().then(function(shows) {
        // Get list of all genres from db (should be optimalized on side of JS from previous db request)
        db.rdb.table("shows").filter({"category":"show"}).orderBy("genre").getField("genre").distinct().run().then(function(genres) {
            res.render("shows", {
                SubpageTitle: i18n.__('Shows'),
                Letters: 'ABCČDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
                AlphaTitles: function(l) {
                    return shows.filter(i => {
                        return i.title.toLowerCase().indexOf(l.toLowerCase()) === 0;
                    });
                },
                Genres: genres,
                SelectedGenre: "all"
            });
        });
    });
});

// Filter view on selected genre
router.get("/porady/:genre", function(req, res) {
    db.rdb.table("shows").filter({"category":"show", "genre" : req.params.genre}).orderBy("title").run().then(function(shows) {
        // Get list of all genres from db (should be optimalized on side of JS from previous db request)
        db.rdb.table("shows").filter({"category":"show"}).orderBy("genre").getField("genre").distinct().run().then(function(genres) {
            res.render("shows", {
                SubpageTitle: i18n.__('Shows'),
                Letters: 'ABCČDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
                AlphaTitles: function(l) {
                    return shows.filter(i => {
                        return i.title.toLowerCase().indexOf(l.toLowerCase()) === 0;
                    });
                },
                Genres: genres,
                SelectedGenre: req.params.genre
            });
        });
    });
});

router.get("/porad/:showTitle", function(req, res) {  
    db.rdb.table("shows").filter({"category":"show", "title" : req.params.showTitle}).orderBy("title").run().then(function(shows) {
        // Update "views" counter by adding 1
        var views = 1;
        if(shows[0].views != null) {
            views = shows[0].views + 1;
        }
        db.rdb.table("shows").filter({"category":"show", "title" : req.params.showTitle}).update({"views": views}).run();

        // Get YouTube feed link
        var feed = getYoutubeFeed(shows[0].youtube);

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
            res.render("showDetail", {
                SubpageTitle: shows[0].title,
                ShowDetails: shows[0],
                Rss: body.data.feed.entry,
                GetThumb: function(item) {
                    return item['media:group'][0]['media:thumbnail'][0].ATTR.url;
                },
                GetDescription: function(item) {
                    return item['media:group'][0]['media:description'][0];
                },
                FormatDateTimeToCZ: function(str) {
                    return formatDateTimeToCZ(str);
                }
            });
        });

        
    });
});

router.get("/filmy", function(req, res) {
    db.rdb.table("shows").filter({"category":"movie"}).orderBy("title").run().then(function(shows) {
        res.render("movies", {
            SubpageTitle: i18n.__('Movies'),
            ShowsList: shows
        });
    });
});

router.get("/pocasi", function(req, res) {
    res.render("weather", {
        SubpageTitle: i18n.__('Weather'),
    });
});

router.get("/o-nas", function(req, res) {
    db.rdb.table("shows").filter({"category":"show"}).run().then(function(shows) {
        var feeds = ["https://www.piratskelisty.cz/rss/"];
        for(var i=0; i<shows.length; i++) {
            feeds.push(getYoutubeFeed(shows[i].youtube));
        }

        res.render("about", {
            SubpageTitle: i18n.__('About'),
            Feeds: feeds
        });
    });
});

router.get("/404", function(req, res) {
    res.render("404", {
        SubpageTitle: i18n.__('404-NotFound'),
    });
});

router.get("/zive", function(req, res) {
    db.rdb.table("shows").filter({"category":"live"}).orderBy("title").run().then(function(shows) {
        res.render("livestreams", {
            SubpageTitle: i18n.__('LiveStreams'),
            ShowsList: shows
        });
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

module.exports = router;