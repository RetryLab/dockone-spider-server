var config = require('../config');
var redis = require('redis');
var crypto = require('crypto');

function Cache(host, port) {
    this.db = redis.createClient(port, host, {
        retry_max_delay: 500
    });
    this.expire = function(date) {
        date = date || new Date();
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    };
}

Cache.prototype.get = function(url, callback) {
    var key = crypto.createHash('md5').update(url).digest('hex');
    this.db.get(key, function(error, value) {
        callback(error, +value || 0);
    })
};

Cache.prototype.set = function(url) {
    var key = crypto.createHash('md5').update(url).digest('hex');
    var db = this.db;
    var expire = this.expire;
    db.incr(key);
    db.ttl(key, function(error, value) {
        if (error) {
            console.error('redis.ttl error:', error);
        }
        if (value < 0) {
            db.expireat(key, expire().getTime());
        }
    })
};

module.exports = new Cache(config.redis.host, config.redis.port);