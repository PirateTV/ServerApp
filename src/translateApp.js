var i18n = require("i18n");
var helpers = require("./helpers.js");
const { version } = require('./package.json');

module.exports.translateApplication = function translateApplication(app) {
    // Prefill global vars with translated texts
    Object.assign(app.locals, {
        Header: {
            Title: i18n.__('Title'),
        },
        Menu: {
            Shows: i18n.__('ShowsMenu'),
            Movies: i18n.__('Movies'),
            LiveStreams: i18n.__('LiveStreams'),
            Weather: i18n.__('Weather'),
            About: i18n.__('About'),
            MeetingRecordings: i18n.__('MeetingRecordings')
        },
        MostWatched: i18n.__('MostWatched'),
        Newest: i18n.__('Newest'),
        Alphabetical: i18n.__('Alphabetical'),
        ByGenre: i18n.__('ByGenre'),
        AllGenres: i18n.__('AllGenres'),
        Footer: {
            ScrollUp: i18n.__('ScrollUp'),
            WatchUsAlso: i18n.__('WatchUsAlso')
        },
        NotFound: i18n.__('404-NotFound'),
        Topics: i18n.__('Topics'),
        WorkingOn: i18n.__('WorkingOn'),
        About: {
            FreeComponents: i18n.__('FreeComponents'),
            UsedSources: i18n.__('UsedSources'),
            Description: i18n.__('PortalDescription'),
            Note: i18n.__('Note'),
            Author: i18n.__('Author')
        },
        ReadMore: i18n.__('ReadMore'),
        SourceLink: i18n.__('SourceLink'),
        Published: i18n.__('Published')
    });
}