var express = require("express");
var session = require("express-session");
var app = require("express")();
module.exports.app = app;

var i18n = require("i18n");
var bodyParser = require("body-parser");

var http = require("http").Server(app);

var router = require("./router.js");
//ar routerEje = require("./router.eje.js");
var helpers = require("./helpers.js");
var log = require('./log.js');
//var auth = require("./auth.js");
var translateApp = require('./translateApp.js');

const { version } = require('./package.json');


// set the view engine to ejs
app.set('view engine', 'ejs');

// translate application
i18n.configure({
  defaultLocale: 'cs_CZ',
  directory: __dirname + '/locales'
});
translateApp.translateApplication(app);

// Middlewares to accept POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// default: using 'accept-language' header to guess language settings
app.use(i18n.init);
// Static endpoints
app.use(express.static('static'));
// Use Sessions for tracking logins
app.use(session({
  secret: 'ee874ec6-5068-445d-a83f-c0c054144d6b',
  resave: true,
  saveUninitialized: false,
}));
// Dynamic endpoints
app.use("/bower_components", express.static("bower_components"));
app.use("/", router);
//app.use("/eje", routerEje);
//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.redirect("/404");
});

// Setup Express Listener
http.listen(helpers.getPort(), helpers.getListenIp(), function() {
  log.log("Starting piratskatelevize " + version);
  log.log("Listening on: " + helpers.getListenIp() + ":" + helpers.getPort());
});
