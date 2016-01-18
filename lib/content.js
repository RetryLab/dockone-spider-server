var config= require('../config').elasticsearch;
var crypto = require('crypto');
var http = require('http');
var agent = new http.Agent({
    keepAlive: true,
    maxSockets: 1000
});

function Content(host, port, index, type) {
    this.host = host;
    this.port = port;
    this.index = index || 'crawler';
    this.type = type || 'type';
}

Content.prototype.request = function(options, body, callback) {
    var req = http.request(options, function(res) {
        if (typeof callback !== 'function')
            return;
        if (res.statusCode === 200) {
            var chunks = [];
            res.on('data', function(chunk) {
                chunks.push(chunk);
            })
            req.on('end', function() {
                callback(Buffer.concat(chunks).toString())
            })
        } else {
            callback(res.statusCode);
        }
    })
    req.setTimeout(500, function() {
        req.abort();
    })
    req.on('error', function(error) {
        callback && callback(error)
    })
    if (body)
        req.end(body);
    else
        req.end();
}

Content.prototype.save = function(url, words) {
    var id = crypto.createHash('md5').update(url).digest('hex')
    var options = {
        method: "POST",
        host: this.host,
        port: this.port,
        path: ['', this.index, this.type, id].join('/')
    }
    var body = {
        doc: {
            url: url,
            words: words,
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
        else if(resp.found)
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
                "and": Object.keys(query).map(function (key){
                	var match= {};
                	match[key]= query[key];
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

    this.request(options, body, function (error, resp){
    	if (error)
            res.status(500).end();
        else if(resp.hits)
            res.json({
            	total: resp.hits.total,
            	hits: resp.hits.hits
            });
        else
            res.status(400).end();
    })
}

Content.prototype.custom= function(req, res){
	var body= req.body;
	var options= {
		method: "POST",
        host: this.host,
        port: this.port,
        path: ['', this.index, this.type, '_search'].join('/')
	}

	this.request(options, body, function (error, resp){
		if (error)
            res.status(500).end();
        else if(resp.hits)
            res.json({
            	total: resp.hits.total,
            	hits: resp.hits.hits
            });
        else
            res.status(400).end();
	})
}

module.exports= new Content(config.host, config.port, config.index, config.type);