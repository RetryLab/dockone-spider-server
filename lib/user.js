var mongo = require('./mongo');
var crypto = require('crypto');

function Account() {
    this.mongo = mongo.get('user').collection('account');
    this.PASSWD_SAFE = "&(*IO"
    this.COOKIE_SAFE = "HU#ON"
}

Account.prototype.create = function(req, res) {
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;
    var passwd = crypto.createHash('sha1').update(password + this.PASSWD_SAFE).digest('hex').toUpperCase();

    this.mongo.insertOne({
        name: name,
        email: email,
        passwd: passwd,
        created: new Date()
    }, function(error, result) {
        if (error)
            res.status(500).end();
        else
            res.json({
                status: "ok"
            });
    })
};

Account.prototype.login = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var passwd = crypto.createHash('sha1').update(password + this.PASSWD_SAFE).digest('hex').toUpperCase();
    var COOKIE_SAFE = this.COOKIE_SAFE;
    this.mongo.findOne({
        email: email,
        passwd: passwd
    }, function(error, doc) {
        if (error)
            res.status(500).end();
        else if (doc)
            var cookievalue = crypto.createHash('md5').update(doc.passwd + COOKIE_SAFE).digest('hex').toUpperCase();
        res.cookie('uuid', [doc._id, cookievalue].join('|'));
        res.json({
            _id: doc._id,
            name: doc.name,
            email: doc.email,
            created: doc.created
        })
        else {
            res.status(400).json({
                status: 'error',
                error: "account is not exist."
            })
        }
    })
}

Account.prototype.auth = function(req, res) {
    var uuid = req.cookie['uuid'] && req.cookie['uuid'].split('|');
    if (!uuid)
        return res.status(401).end();

    var userId = uuid[0],
        validateValue = uuid[1],
        COOKIE_SAFE = this.COOKIE_SAFE;

    this.mongo.findOne({
        _id: userId
    }, function(error, doc) {
        if (error)
            res.status(500).end()
        else if (doc) {
            if (validateValue === crypto.createHash('md5').update(doc.passwd + COOKIE_SAFE).digest('hex').toUpperCase())
                next();
            else
                res.status(401).end();
        } else
            res.status(401).end();
    })
}

function Machine() {
    this.mongo = mongo.get('user').collection('account');
}

Machine.prototype.validate = function(body) {

}

Machine.prototype.NewMachine = function(body) {

    this.validate(body);

    return {
        user_id: body.user_id,
        name: body.name,
        os: body.os,
        os_version: body.os_version,
        mem_size: body.mem_size,
        disk_size: body.disk_size,
        receive_chart: body.receive_chart,
        transport_chart: body.transport_chart,
    }
}

Machine.prototype.create = function(req, res) {
    var body = req.body;
    try {
        body = this.NewMachine(body);
    } catch (e) {
        return res.status(400).end({
            status: 'error',
            error: e.toString()
        })
    }

    this.mongo.insertOne(body, function(error, result) {
        if (error)
            res.status(500).end();
        else {
            body._id = result.insertedId;
            res.json(body);
        }
    })
}

Machine.prototype.update = function(req, res) {
    var id = req.params.id;
    var body = req.body;
    delete body._id;
    delete body.userId;

    try {
        body = this.validate();
    } catch (e) {
        return res.status(400).end({
            status: 'error',
            error: e.toString()
        })
    }

    this.mongo.update({
        _id: id
    }, {
        $set: body
    }, function(error, result) {
        if (error)
            res.status(500).end();
        else
            res.json({
                status: 'ok'
            })
    })
}

Machine.prototype.get = function(req, res) {
    var id = req.params.id;
    this.mongo.findOne({
        _id: id
    }, function(error, doc) {
        if (error)
            res.status(500).end();
        else if (doc)
            res.json(doc);
        else
            res.status(400).json({
                status: 'error',
                error: 'not found machine.'
            })
    })
}

Machine.prototype.delete = function(req, res) {
    var id = req.params.id;
    this.mongo.remove({
        _id: id
    }, function(error, result) {
        if (error)
            res.status(500).end();
        else
            res.json({
                status: 'ok'
            })
    })
}

function Profile(){

}

Profile.prototype.create= function(){
	
}