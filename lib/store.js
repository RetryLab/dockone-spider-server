var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');
var levelup = require('levelup')
var crypto = require('crypto');
var cache = require('./cache');

function GetToDate(time) {
    var date = time ? new Date(time) : new Date();
    return date.toLocaleDateString();
}

function Store(dbpath, options) {
    this.db = levelup(dbpath);
    this.queue = [];
    this.isRun = false;
    this.urls = [];
    this.limit = 1000;
    this.load();
}
Store.prototype = new EventEmitter();

Store.prototype.check = function() {
    if (this.db.isClosed()) {
        throw new Error('level db is closed.');
    }
};

Store.prototype.find = function(limit, callback) {
    this.check();
    if(this.urls.length < limit){
        this.load(function (error, urls){
            if(error)
                callback(error);
            else
                callback(null, urls.splice(0, limit))
        })
    }
    else{
        callback(null, this.urls.splice(0, limit));
    }
    console.log('url length:', this.urls.length);
};

Store.prototype.load = function(callback) {
    var self = this;
    var start = [0, GetToDate()].join('_');
    var db = this.db;
    db.createReadStream({
            gte: start,
            limit: this.limit || 1000,
        })
        .on('data', function(data) {
            // console.log(data.key, '=', data.value)
            db.del(data.key);
            self.urls.push(data.value);
        })
        .on('error', function(err) {
            // console.log('Oh my!', err)
            // callback(err, datas);
            callback && callback('error');
        })
        .on('close', function() {
            // console.log('Stream closed')
            // callback(datas);
            callback && callback('close');
        })
        .on('end', function() {
            callback && callback(null, self.urls);
        })
}

Store.prototype.apply = function(url, index) {
    this.check();
    var md5str = crypto.createHash('md5').update(url).digest('hex');
    var key = [index || 0, GetToDate(), md5str].join('_');
    var db = this.db;
    db.put(key, url);
}

var store = module.exports = new Store(__dirname + '/../urlstore');




if (!module.parent) {
    setInterval(function() {
        store.find(10, function (error, urls) {
            console.log(urls);
        })
    }, 100)
}