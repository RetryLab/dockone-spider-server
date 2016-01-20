var cache = require('./cache');
var store = require('./store');
// var crawler = require('./crawler');
var content= require('./content');
var analysis= require('./analysis');
var docker= require('./docker');
var mongo= require('./mongo');

function Mission() {
    this.mission_length = 10;
};

Mission.prototype.start = function(req, res) {
    var dockerID = req.params.id;
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
    var dockerID = req.params.id;
    var body = req.body;
    var links = body.links;
    var queue = body.queue || 0;
    var url = body.url;
    var errorinfo= body.error;
    var words = body.content;
    var error_count= 0;
    var content_count= 0;
    var link_count= 0;
    if (url) {
        cache.set(url);
        if(links)
            links.forEach(function (link) {
                link_count++;
                cache.get(link, function(error, index) {
                    store.apply(link, index);
                })
            });
        if(words){
            content_count++;
            content.save(url, words, errorinfo)
        }
        else if(errorinfo){
            error_count++;
            content.save(url, words, errorinfo)
        }
            // crawler.update(url, words, errorinfo);
    }
    if(content_count || link_count || error_count)
        docker.findOne(mongo.ObjectId(dockerID), function (error, doc){
            if(doc){
                analysis.inc(doc.user_id, doc.machine_id, doc.profile_id, content_count, link_count, error_count);
            }
        })
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
    var dockerID = req.params.id;
    var body= req.body;
    var link= body.link;
    var links= body.links;
    var queue = body.queue || 0;
    var error_count= 0;
    var content_count= 0;
    var link_count= 0;

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
    if(content_count || link_count || error_count)
        docker.findOne(mongo.ObjectId(dockerID), function (error, doc){
            if(doc){
                analysis.inc(doc.user_id, doc.machine_id, doc.profile_id, content_count, link_count, error_count);
            }
        })
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