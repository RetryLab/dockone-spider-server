var cache = require('./cache');
var store = require('./store');
var crawler = require('./crawler');
var crypto = require('crypto');
var md5Crypto = crypto.createHash('md5');

function Mission() {

    this.mission_length = 100;
};

Mission.prototype.start = function(req, res) {
    var missionId = req.params.id;
    store.find(this.mission_length, function(error, urls) {
        if (error)
            res.status(500).end();
        else
            res.json({
                urls: urls
            });
    })
};


Mission.prototype.result = function(req, res) {
    var missionId = req.params.id;
    var body = req.body;
    var links = body.links;
    var queue = body.queue;
    var url = body.url;
    var content = body.content;
    var key = md5Crypto.update(url).digest('hex');

    cache.set(key);

    links.forEach(function(link) {
        cache.get(key, function(error, index) {
            store.apply(link, index);
        })
    });

    crawler.update(key, url, content);

    if (queue === 0) {
        store.find(this.mission_length, function(error, urls) {
            if (error)
                res.status(500).end();
            else
                res.json({
                    urls: urls
                });
        })
    } else {
        res.json({
        	
        });
    }
}

module.exports = new Mission();