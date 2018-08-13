var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var api = require("./route/api");

var argv = require('yargs').argv;


mongoose.connect('mongodb://localhost/wirewerksdb');
mongoose.Promise = global.Promise;


//var app = express();
//app.use(express.static(__dirname + '/public'));
//app.use(express.json());       // to support JSON-encoded bodies
////app.use(express.urlencoded()); // to support URL-encoded bodies
//app.use("/", api);
//
//app.listen(5000, () => {
//    console.log("Server running on port 5000...");
//});



//--------------------
var argv = require('yargs').argv;

var Server = require('./server');
var server = new Server();
server.start(argv.env);