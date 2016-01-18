var crypto = require('crypto');
var urltool = require('url');
var mongo = require('./mongo');

function Crawler() {
    this.mongo = mongo.get('crawler').collection('main');
}

Crawler.prototype.init= function(){
    
}

Crawler.prototype.update = function(url, content, error) {
    var id = crypto.createHash('md5').update(url).digest('hex')
    var urlArr = urltool.parse(url);
    this.mongo.save({
        _id: id,
        url: url,
        domain: urlArr.hostname,
        content: content,
        error: error || null,
        date: new Date()
    });
};

Crawler.prototype.get = function(req, res) {
    var id = req.params.id;
    this.mongo.findOne({
        _id: id
    }, function(error, doc) {
        if (error)
            res.status(500).end()
        else if (doc)
            res.json(doc);
        else
            res.json({
                error: 'not found content.'
            })

    })
};

Crawler.prototype.find = function(req, res) {

    var query = req.query;
    var select= {};
    var options= {};
    if (query.domain)
        select.domain = query.domain;
    if (query.url)
        select.url = query.url;
    if (query.start)
        select.date=  !select.date ? {$gte : new Date(query.start)} : select.date['$gte']= new Date(query.start);
    if (query.end)
        select.date=  !select.date ? {$lte : new Date(query.end)} : select.date['$lte']= new Date(query.end);

    if(query.limit)
        options.limit= query.limit;
    if(query.field)
        options.field= query.field;

    this.mongo.find(select, options).toArray(function (error, docs){
        if(error){
            res.status(500).end();
        }
        else{
            res.json(docs);
        }
    })
}

module.exports = new Crawler();