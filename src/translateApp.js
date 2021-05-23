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
            MeetingRecordings: i18n.__('MeetingRecordings'),
            Regions: i18n.__('Regions')
        },
        MostWatched: i18n.__('MostWatched'),
        MostWatchedMoviesLbl: i18n.__('MoviesWatched'),
        Newest: i18n.__('Newest'),
        Alphabetical: i18n.__('Alphabetical'),
        ByGenre: i18n.__('ByGenre'),
        AllGenres: i18n.__('AllGenres'),
        AllRegions: i18n.__('AllRegions'),
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
            Author: i18n.__('Author'),
            ForDownload: i18n.__('ForDownload'),
            Contact: i18n.__('Contact'),
            ContactContent: i18n.__('ContactContent')
        },
        ReadMore: i18n.__('ReadMore'),
        SourceLink: i18n.__('SourceLink'),
        Published: i18n.__('Published'),
        MoviesDescription: i18n.__('MoviesDescription'),
        ShowMoreOnYT: i18n.__('ShowMoreOnYT'),
        EventStart: i18n.__('EventStart'),
        OnAirEvents: i18n.__('OnAirEvents'),
        UpcomingEvents: i18n.__('UpcomingEvents'),
        NoOnAirEvents: i18n.__('NoOnAirEvents'),
        NoUpcomingEvents: i18n.__('NoUpcomingEvents'),
        ScrollInfoText: i18n.__('ScrollInfoText'),
        MenuAdmin: {
            LiveStreams: i18n.__('AdminLiveStreams'),
            Logout: i18n.__('AdminLogout'),
            Movies: i18n.__('AdminMovies')
        },
        AdminDashboard: {
            MyEvents: i18n.__('MyEvents'),
            EventTitle: i18n.__('EventTitle'),
            EventCoverUrl: i18n.__('EventCover'),
            EventStart: i18n.__('EventStart'),
            EventYoutubeUrl: i18n.__('EventYoutubeUrl'),
            EventSlidoUrl: i18n.__('EventSlidoUrl'),
            EventOnAir: i18n.__('EventOnAir'),
            EventUpdate: i18n.__('EventUpdate'),
            EventDelete: i18n.__('EventDelete'),
            EventDeleteConfirmation: i18n.__('EventDeleteConfirmation'),
            EventEdit: i18n.__('EventEdit'),
            EventCreateNew: i18n.__('EventCreateNew'),
            MovieVideoUrl: i18n.__('MovieVideoUrl'),
            MovieDescription: i18n.__('MovieDescription'),
            MovieCreateNew: i18n.__('MovieCreateNew'),
            MovieDeleteConfirmation: i18n.__('MovieDeleteConfirmation'),
            MyMovies: i18n.__('MyMovies'),
            MovieTitle: i18n.__('MovieTitle'),
            MovieAuthor: i18n.__('MovieAuthor'),
            MovieAuthorUrl: i18n.__('MovieAuthorUrl'),
            MovieLicense: i18n.__('MovieLicense'),
            MovieLicenseUrl: i18n.__('MovieLicenseUrl'),
            MovieUrl: i18n.__('MovieUrl'),
            MovieGenre: i18n.__('MovieGenre'),
            MovieCaptionsUrl: i18n.__('MovieCaptionsUrl')
        },
        Author: i18n.__('Author'),
        EventPlannedStart: i18n.__('EventPlannedStart')
    });
}