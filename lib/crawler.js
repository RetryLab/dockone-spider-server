var urltool= require('url');
var mongo = require('./mongo');


function Crawler () {
	this.mongo = mongo.get('crawler').collection('main');
}

Crawler.prototype.update = function(id, url, content) {
	var urlArr= urltool.parse(url);

	this.mongo.save({
        _id: id,
        url: url,
        domain: urlArr.hostname,
        content: content,
        date: new Date()
    });
};

Crawler.prototype.get = function(req, res) {
	var id= req.params.id;
	this.mongo.findOne({_id: id}, function (error, doc){
		if(error)
			res.status(500).end()
		else if(doc)
			res.json(doc);
		else
			res.json({
				error: 'not found content.'
			})

	})
};


module.exports= new Crawler();