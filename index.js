var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var api = require("./route/api");

mongoose.connect('mongodb://localhost/wirewerksdb', function () { /* dummy function */ })
    .then(() => {
        var argv = require('yargs').argv;
        var Server = require('./server');
        var server = new Server();
        return server.start(argv.env);
    })
    .catch(err => { // mongoose connection error will be handled here
        console.error('App starting error:', err.stack);
        process.exit(1);
    });

mongoose.Promise = global.Promise;