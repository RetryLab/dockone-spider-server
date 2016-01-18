var config = require('../config');
var crypto = require('crypto');
var http = require('http');
var agent = new http.Agent({
    keepAlive: true,
    maxSockets: 1000
});
var elasticsearch_address = config.elasticsearch.split(':');


function Content(host, port, index, type) {
    this.host = host;
    this.port = port;
    this.index = index || 'crawler';
    this.type = type || 'content';

    this.init();
}

Content.prototype.init = function() {
    var options = {
        method: "PUT",
        host: this.host,
        port: this.port,
        path: ['', this.index].join('/')
    }
    this.request(options);
}

Content.prototype.request = function(options, body, callback) {
    var req = http.request(options, function(res) {
        var chunks = [];
        res.on('data', function(chunk) {
            chunks.push(chunk);
        })
        res.on('end', function() {
            var data= Buffer.concat(chunks).toString();
            try{
                data= JSON.parse(data);
            }catch(e){
                callback && callback(e);
                return;
            }
            if(data.error)
                callback && callback(data.error)
            else
                callback && callback(null, data);
        })
    })
    req.setTimeout(500, function() {
        req.abort();
    })
    req.on('error', function(error) {
        console.log('content error:', error.toString());
        callback && callback(error)
    })
    if (body)
        req.end(body);
    else
        req.end();
}

Content.prototype.save = function(url, words, errorinfo) {
    var id = crypto.createHash('md5').update(url).digest('hex')
    var options = {
        method: "POST",
        host: this.host,
        port: this.port,
        path: ['', this.index, this.type, id, '_update'].join('/')
    }
    var body = {
        doc: {
            url: url,
            words: words,
            error: errorinfo,
            date: new Date()
        },
        doc_as_upsert: true
    }

    this.request(options, JSON.stringify(body));
};

Content.prototype.get = function(req, res) {
    var url = req.query.url;
    var id = crypto.createHash('md5').update(url).digest('hex');

    var options = {
        method: "GET",
        host: this.host,
        port: this.port,
        path: ['', this.index, this.type, id].join('/')
    }

    this.request(options, null, function(error, resp) {
        if (error)
            res.status(500).end();
        else if (resp.found)
            res.json(resp._source);
        else
            res.status(400).end();
    })
}

Content.prototype.find = function(req, res) {
    var query = req.query;
    var search = '_search';
    var body;
    if (query.q) {
        search += ('?q=' + query.q)
    } else {
        body = {
            "query": {
                "and": Object.keys(query).map(function(key) {
                    var match = {};
                    match[key] = query[key];
                    return {
                        match: match
                    }
                })
            }
        }
    }
    var options = {
        method: "GET",
        host: this.host,
        port: this.port,
        path: ['', this.index, this.type, search].join('/')
    }

    this.request(options, body, function(error, resp) {
        if (error)
            res.status(500).end();
        else if (resp.hits)
            res.json({
                total: resp.hits.total,
                hits: resp.hits.hits
            });
        else
            res.status(400).end();
    })
}

Content.prototype.custom = function(req, res) {
    var body = req.body;
    var options = {
        method: "POST",
        host: this.host,
        port: this.port,
        path: ['', this.index, this.type, '_search'].join('/')
    }

    this.request(options, body, function(error, resp) {
        if (error)
            res.status(500).end();
        else if (resp.hits)
            res.json({
                total: resp.hits.total,
                hits: resp.hits.hits
            });
        else
            res.status(400).end();
    })
}

module.exports = new Content(elasticsearch_address[0], +elasticsearch_address[1]);