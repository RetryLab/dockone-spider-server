var _ = require('underscore');
var mongo = require('./mongo');

function Analysis () {
    this.mongo = mongo.get('analysis').collection('main');
    this.init();
}

Analysis.prototype.init= function(){
	this.mongo.createIndex({date: 1, userId: 1, machineId: 1, profileId:1 }, {background: true, w: 1}, function (err){
		if(err)
			console.error('analysis init error:', err);
	})
}

Analysis.prototype.inc= function(userId, machineId, profileId, content_count, link_count, error_count) {
	this.mongo.update({date: this.getDate(), user_id: mongo.ObjectId(userId), machine_id: mongo.ObjectId(machineId), profile_id: mongo.ObjectId(profileId)}, {$inc: {content: content_count || 0, link: link_count || 0, error: error_count || 0}}, {upsert: true, w: 0});
};

Analysis.prototype.getDate= function(time){
	var date= time? new Date(time) : new Date();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

Analysis.prototype.find= function(req, res){
	var query = req.query;
	var params= req.params;
	var date = this.getDate();
	var userId = req.user._id;
	var select = {
		date: date,
		user_id: mongo.ObjectId(userId)
	};
	var keys= [];
	var funs= 'function(o, t){ t.content+= o.content|| 0; t.link+= o.link|| 0; t.error+= o.error|| 0; }';
	if(query.start || query.end){
		select.date= {};
		if(query.start)
			select.date['$gt']= this.getDate(query.start);
		if(query.end)
			select.date['$lte']= this.getDate(query.end);
	}
	if(params.machineId)
		select.machine_id= mongo.ObjectId(params.machineId);
	if(params.profileId)
		select.profile_id= mongo.ObjectId(params.profileId);

	if(query.key){
		if(Array.isArray(query.key)){
			keys= query.key;
		}
		else{
			keys= [query.key];
		}
	}
	else{
		keys= ['date']
	}
	// console.log(select)
	this.mongo.group(keys, select, { content: 0, link: 0, error: 0}, funs, function (error, docs){
		if(error)
			res.status(500).end();
		else
			res.json(docs);
	})
}

module.exports= new Analysis();