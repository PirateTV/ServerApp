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
            Feed.load('https://www.piratskelisty.cz/rss/aktuality', function(err, rss1) {
                var mergedTopics = rss.items.concat(rss1.items);

                res.render("home", {
                    SubpageTitle: i18n.__('Home'),
                    RssTopics: mergedTopics.sort(function(a, b) {
                        // Turn your strings into dates, and then subtract them
                        // to get a value that is either negative, positive, or zero.
                        return new Date(b.pubDate) - new Date(a.pubDate);
                    }).slice(0,6),
                    FormatDateTimeToCZ: function(str) {
                        return formatDateTimeToCZ(str);
                    },
                    MostWatchedShows: shows.slice(0,4),
                    SanitizeStringToUrl: function(str) {
                        return sanitizeStringToUrl(str);
                    }
                });
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
                SelectedGenre: "all",
                SanitizeStringToUrl: function(str) {
                    return sanitizeStringToUrl(str);
                }
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
                SelectedGenre: req.params.genre,
                SanitizeStringToUrl: function(str) {
                    return sanitizeStringToUrl(str);
                }
            });
        });
    });
});

router.get("/porad/:showTitle", function(req, res) {
    res.redirect("/porad/" + req.params.showTitle + "/nejnovejsi");
});

router.get("/porad/:showTitle/:showEpisode", function(req, res) {  
    db.rdb.table("shows").filter({"category":"show"}).orderBy("title").run().then(function(shows) {
        show = shows.find(function(elem) {
            return sanitizeStringToUrl(elem.title) == sanitizeStringToUrl(req.params.showTitle);
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
                            return sanitizeStringToUrl(elem.title) == sanitizeStringToUrl(req.params.showEpisode);
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
                    res.render("showDetail", {
                        SubpageTitle: show.title,
                        ShowDetails: show,
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
                            return sanitizeStringToUrl(str);
                        }
                    });
                }
            });
        }
    });
});

router.get("/filmy", function(req, res) {
    db.rdb.table("shows").filter({"category":"movie"}).orderBy("title").run().then(function(shows) {
        res.render("movies", {
            SubpageTitle: i18n.__('Movies'),
            ShowsList: shows,
            SanitizeStringToUrl: function(str) {
                return sanitizeStringToUrl(str);
            }
        });
    });
});

router.get("/filmy/:showMovie", function(req, res) {  
    db.rdb.table("shows").filter({"category":"movie"}).orderBy("title").run().then(function(shows) {
        show = shows.find(function(elem) {
            return sanitizeStringToUrl(elem.title) == sanitizeStringToUrl(req.params.showMovie);
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

            res.render("movieDetail", {
                SubpageTitle: show.title,
                ShowDetails: show,
                SanitizeStringToUrl: function(str) {
                    return sanitizeStringToUrl(str);
                }
            });
        }
    });
});

router.get("/pocasi", function(req, res) {
    res.render("weather", {
        SubpageTitle: i18n.__('Weather'),
    });
});

router.get("/o-nas", function(req, res) {
    db.rdb.table("shows").filter({"category":"show"}).run().then(function(shows) {
        var feeds = ["https://www.piratskelisty.cz/rss/", "https://www.piratskelisty.cz/rss/aktuality"];
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

function sanitizeStringToUrl(str) {
    str = str.toString();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return str;
}

module.exports = router;