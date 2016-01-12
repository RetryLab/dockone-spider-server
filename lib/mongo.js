var EventEmitter = require('events').EventEmitter;
var log = require('log4js').getLogger('mongo');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var config= require('../config');

function Mongo(options) {
    this.options = options || {};
    this.dbs = {};
    this.statusCode = -1;
    this.errors = [];
    return this;
}

Mongo.prototype = new EventEmitter();

Mongo.prototype.status = function() {
    if (this.errors.length === 0 && this.statusCode === 0)
        return this.statusCode;
    else if (this.errors.length)
        return this.errors;
    else
        return 'mongo no ready!'
}
Mongo.prototype.init = function() {
    var _this = this;
    this.on('ready', function() {
        _this.statusCode = 0;
    })
    this.on('connect_success', function (name, uri) {
        var total= Object.keys(_this.options).length;
        var curr= Object.keys(_this.dbs).length;
        log.info('connect success:', name, uri, [curr,total].join('/'));
        if (total === curr)
            _this.emit('ready');
    })
    this.on('connect_error', function (error, name, uri) {
        log.error('connect error:', error, name, uri);
        _this.errors.push(error)
    })

    if(Object.keys(this.options).length){
	    for(var name in this.options){
	    	this.load(name, this.options[name]);
	    }
    }
    else{	
    	this.emit('ready');
    }
    return this;
}

Mongo.prototype.load = function(dbname, uri) {
    var _this = this;
    var options = {};
    if (uri.indexOf('@') > -1) {
        options.uri_decode_auth = true;
    }
    // log.info('connect:', dbname, uri);
    MongoClient.connect(uri, options, function (err, db) {
        if (err) {
            _this.emit('connect_error', err, dbname, uri)
        } else {
            _this.set(dbname, db)
            _this.emit('connect_success', dbname, uri)
        }
    });
}

Mongo.prototype.set = function(name, db) {
    this.dbs[name] = db;
}

Mongo.prototype.get = function(name) {
    return this.dbs[name];
}

module.exports = new Mongo({
    process: config.mongo.process
});