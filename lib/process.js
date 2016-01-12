var mongo= require('./mongo');

function Process () {
	this.mongodb= mongo.get('process').collection('main');
}

Process.prototype.online = function(req, res) {
	var processId= req.params.id;
	var data= {
		ip: req.ip
	}
	this.mongodb.insertOne(data, function (error, result){
		if(error)
			res.status(500).end();
		else{
			data._id= result.insertedId;
			res.json(data);
		}
	})
};

Process.prototype.offline = function(req, res) {
	var processId= req.params.id;
	this.mongodb.remove({_id: processId});
	res.end();
};


module.exports= new Process();