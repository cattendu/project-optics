var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var route = require("./route/api");
var cookie = require('cookie');

mongoose.connect('mongodb://localhost/wirewerksdb');
mongoose.Promise = global.Promise;


var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies
app.use("/", route);

app.listen(5000, () => {
    console.log("Server running on port 5000...");
});