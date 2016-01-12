var crypto= require('crypto');
var levelup = require('levelup')
var md5Crypto= crypto.createHash('md5');

function GetToDate(time){
	var date= time ? new Date(time) : new Date();
	return date.toLocaleDateString();
}

function Store (dbpath, options) {
	this.db= levelup(dbpath);
}

Store.prototype.check = function() {
	if(this.db.isClosed()){
		throw new Error('level db is closed.');
	}
};

Store.prototype.find = function (limit, callback) {
	this.check();
	var datas= [];
	var db= this.db;
	var start= [0, GetToDate()].join('_');
	
	db.createReadStream({
		gte: start,
		limit: limit || 10,
	})
	  .on('data', function (data) {
	    // console.log(data.key, '=', data.value)
	    db.del(data.key);
	    datas.push(data.value);
	  })
	  .on('error', function (err) {
	    // console.log('Oh my!', err)
	    callback(err, datas);
	  })
	  .on('close', function () {
	    console.log('Stream closed')
	    callback(datas);
	  })
	  .on('end', function () {
	    console.log('Stream closed');
	    callback(datas);
	  })
};

Store.prototype.apply= function (url, index){
	this.check();
	var md5str= md5Crypto.update(url).digest('hex');
	var key= [index || 0, GetToDate(), md5str].join('_');
	var db= this.db;
	db.put(key, url);
}

module.exports= new Store(__dirname+ '/../leveldata/urlstore');


