var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Api = require('./route/api');
var cookie = require('cookie');
var cors = require('cors');
var http = require('http');
//var compression = require('compression');

var config = {
    default: {
        port: 3000,
        bodyLimit: '100kb',
        corsHeaders: ['Link'],
        clientFolder: 'src'
    },

    production: {
        port: process.env.PORT || 80,
        bodyLimit: '100kb',
        corsHeaders: ['Link'],
        clientFolder: 'dist'
    }
};

class Server {
    constructor() {
        this.app = express();
    }

    _cors() {
        return {
            origin: '*',
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
            exposeHeaders: this.config.corsHeaders
        };
    }

    _setup() {
        this.app.set('query parser', 'extended');
        this.app.enable('case sensitive routing');
        this.app.set('port', this.config.port);
        this.app.set('title', 'Wirewerks');
        this.app.use(cors(this._cors()));
        this.app.use(express.static(__dirname + '/public'));
        this.app.use(bodyParser.json({ limit: this.config.bodyLimit }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(express.json());       // to support JSON-encoded bodies
        this.app.options('*', cors(this._cors())); // Enable cors pre-flight
        //this.app.use(compression());
    }

    _api() {
        new Api(this.app, this.config);
    }

    _onstart() {
        console.log('Server started on port: ', this.config.port);
    }

    start(env) {
        env = env || 'default';
        this.config = config[env];

        if (process.env.PORT)
            this.config.port = process.env.PORT;

        this.server = http.createServer(this.app);

        this._setup();
        this._api();

        this.server.listen(this.config.port, this._onstart.bind(this));
    }
}

module.exports = Server;
