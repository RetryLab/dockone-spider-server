var cache = require('./cache');
var store = require('./store');
// var crawler = require('./crawler');
var content= require('./content');

function Mission() {

    this.mission_length = 10;
};

Mission.prototype.start = function(req, res) {
    var missionId = req.params.id;
    // console.log('Mission start...:', missionId)
    store.find(this.mission_length, function(error, urls) {
        if (error)
            res.status(500).end();
        else
            res.json({
                urls: urls
            });
    })
};


Mission.prototype.content = function(req, res) {
    // console.log('Mission result...')
    var missionId = req.params.id;
    var body = req.body;
    var links = body.links;
    var queue = body.queue || 0;
    var url = body.url;
    var errorinfo= body.error;
    var words = body.content;
    if (url) {
        cache.set(url);
        if(links)
            links.forEach(function (link) {
                cache.get(link, function(error, index) {
                    store.apply(link, index);
                })
            });
        if(content || errorinfo)
            content.save(url, words, errorinfo)
            // crawler.update(url, words, errorinfo);
    }
    res.end();
    // if (queue === 0) {
    //     store.find(this.mission_length, function(error, urls) {
    //         if (error)
    //             res.status(500).end();
    //         else
    //             res.json({
    //                 urls: urls
    //             });
    //     })
    // } else {
    //     res.json({
    //     });
    // }
}


Mission.prototype.links= function(req, res){
    // console.log('Mission links...')
    var body= req.body;
    var link= body.link;
    var links= body.links;
    var queue = body.queue || 0;

    if(link){
        cache.get(link, function(error, index) {
            store.apply(link, index);
        })
    }
    if(Array.isArray(links)){
        links.forEach(function(url) {
            cache.get(url, function(error, index) {
                store.apply(url, index);
            })
        })
    }
    res.end();
    // if (queue === 0) {
    //     store.find(this.mission_length, function(error, urls) {
    //         if (error)
    //             res.status(500).end();
    //         else
    //             res.json({
    //                 urls: urls
    //             });
    //     })
    // } else {
    //     res.json({
    //     });
    // }
}

module.exports = new Mission();