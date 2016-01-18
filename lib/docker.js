var util= require('./util');
var mongo = require('./mongo');

function Docker() {
    this.secret_key = "!$@EGAHAC&%1JHWQCVB$!FAZ1230$@#R";
    this.mongo = mongo.get('docker').collection('main');
    this.mongo.createIndex({
        "date": 1
    }, {
        expireAfterSeconds: 90
    });
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
        user_id: query.user_id,
        machine_id: query.machine_id,
        profile_id: query.profile_id
    }
    if (processId) {
        this.mongo.updateOne({
            _id: processId
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

module.exports = new Docker();
