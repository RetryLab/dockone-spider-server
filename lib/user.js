var _ = require('underscore');
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
        else if (doc) {
            var cookievalue = crypto.createHash('md5').update(doc.passwd + COOKIE_SAFE).digest('hex').toUpperCase()
            res.cookie('uuid', [doc._id, cookievalue].join('|'));
            res.json({
                _id: doc._id,
                name: doc.name,
                email: doc.email,
                created: doc.created
            })
        } else {
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
                (req.user = doc, next())
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
        description: body.description,
        os: body.os,
        os_version: body.os_version,
        mem_size: body.mem_size,
        disk_size: body.disk_size,
        receive_size: body.receive_size,
        transport_size: body.transport_size,
        created: new Date(),
        updated: new Date()
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
    delete body.user_id;

    try {
        body = this.validate();
        body.updated = new Date();
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

Machine.prototype.find = function(req, res) {
    if (!req.user) {
        return res.status(401).end();
    }
    var user_id = req.user._id;

    this.mongo.find({
        user_id: user_id
    }).toArray(function(error, docs) {
        if (error)
            res.status(500).end();
        else
            res.json(docs)
    })
}

function Profile() {
    this.mongo = mongo.get('user').collection('profile');
}

Profile.prototype.validate = function(body) {

}

Profile.prototype.NewProfile = function(body) {

    this.validate(body);

    return {
        user_id: body.user_id,
        machine_id: body.machine_id,
        name: body.name,
        description: body.description,
        mem_use: body.mem_use,
        disk_use: body.disk_use,
        receive_use: body.receive_use,
        transport_use: body.transport_use,
        created: new Date(),
        updated: new Date()
    }
}

Profile.prototype.create = function(req, res) {
    var body = req.body;

    try {
        body = this.NewProfile(body);
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

Profile.prototype.update = function(req, res) {
    var id = req.params.id;
    var body = req.body;
    delete body._id;
    delete body.user_id;
    delete body.machine_id;

    try {
        body = this.validate();
        body.updated = new Date();
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

Profile.prototype.get = function(req, res) {
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
                error: 'not found profile.'
            })
    })
}

Profile.prototype.delete = function(req, res) {
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

Profile.prototype.find = function(req, res) {
    if (!req.user) {
        return res.status(401).end();
    }
    var user_id = req.user._id;
    var machine_id = req.params.machineId;
    var query = {
        user_id: user_id
    };
    if (machine_id)
        query.machine_id = machine_id;

    this.mongo.find(query).toArray(function(error, docs) {
        if (error)
            res.status(500).end();
        else
            res.json(docs)
    })
}

exports.account = new Account();
exports.machine = new Machine();
exports.profile = new Profile();