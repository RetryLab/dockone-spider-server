var util= require('./util');
var mongo = require('./mongo');

function Docker() {
    this.secret_key = "!$@EGAHAC&%1JHWQCVB$!FAZ1230$@#R";
    this.mongo = mongo.get('docker').collection('main');
    
    this.init();
}

Docker.prototype.init= function(){
    this.mongo.createIndex({userId: 1 }, {background: true, w: 1}, function (err){
        if(err)
            console.error('docker init error:', err);
    })
    this.mongo.createIndex({
        "date": 1
    }, {
        expireAfterSeconds: 90
    });
}

Docker.prototype.findOne= function(dockerID, callback){
    this.mongo.findOne({_id: mongo.ObjectId(dockerID) }, function (error, doc){
        callback( error, doc);
    })
}

Docker.prototype.auth = function(req, res) {
    var authId = req.params.authId;
    if (!authId)
        return res.status(400).end();
    var encodestr= util.webSafeBase64Decode(authId);
    var resultStr = util.decode(encodestr, this.secret_key);
    if (resultStr) {
        var resultArr = resultStr.split(',');
        res.json({
            userID: resultArr[0],
            machineID: resultArr[1],
            profileID: resultArr[2]
        })
    } else {
        return res.status(400).end();
    }
}

Docker.prototype.online = function(req, res) {
    var processId = req.params.id;
    console.log('docker', processId, 'online')
    var query = req.query;
    var data = {
        // _id: processId,
        date: new Date(),
        ip: req.ip,
        user_id: mongo.ObjectId(query.user_id),
        machine_id: mongo.ObjectId(query.machine_id),
        profile_id: mongo.ObjectId(query.profile_id)
    }
    if (processId) {
        this.mongo.updateOne({
            _id: mongo.ObjectId(processId)
        }, {
            $set: data
        }, {
            upsert: true
        }, function(error, result) {
            if (error)
                res.status(500).end();
            else {
                res.json(data);
            }
        })
    } else {
        this.mongo.insertOne(data, function(error, result) {
            if (error)
                res.status(500).end();
            else {
                data._id = result.insertedId;
                res.json(data);
            }
        })
    }
};

Docker.prototype.offline = function(req, res) {
    var processId = req.params.id;
    console.log('docker', processId, 'offline')
    this.mongo.remove({
        _id: mongo.ObjectId(processId)
    });
    res.end();
};

Docker.prototype.active= function(req, res){
    var query= req.params;
    var userID= req.user._id;
    var machineID= query.machine_id;
    var profileID= query.profile_id;
    var select= {
        user_id: mongo.ObjectId(userID)
    }
    if(machineID)
        select.machine_id= mongo.ObjectId(machineID)
    if(profileID)
        select.profile_id= mongo.ObjectId(profileID);

    this.mongo.find(select, {fields: {ip: 1, date: 1}}).toArray(function (error, docs){
        if (error)
                res.status(500).end();
            else {
                res.json(docs);
            }
    })
}

module.exports = new Docker();
