var _ = require('underscore');
var mongo = require('./mongo');
var crypto = require('crypto');

function Account() {
    this.mongo = mongo.get('user').collection('account');
    this.PASSWD_SAFE = "&(*IO";
    this.COOKIE_SAFE = "HU#ON";
}

Account.prototype.NewAccount = function(body) {

    var passwd = crypto.createHash('sha1').update(body.password + this.PASSWD_SAFE).digest('hex').toUpperCase();

    return {
        name: body.name,
        email: body.email,
        passwd: passwd,
        created: new Date(),
        updated: new Date()
    }
}

Account.prototype.create = function(req, res) {
    var _this = this;
    var email = req.body.email;
    var body = req.body;

    this.mongo.findOne({
        email: email
    }, function(error, doc) {
        if (error)
            res.status(500).end();
        else if (doc)
            res.json({
                status: "error",
                error: "email is exist"
            })
        else {
            try {
                body = _this.NewAccount(body);
            } catch (e) {
                return res.status(400).json({
                    status: 'error',
                    error: e.toString()
                })
            }
            _this.mongo.insertOne(body, function(error, result) {
                if (error)
                    res.status(500).end();
                else
                    res.json({
                        status: "ok"
                    });
            })
        }
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
            var str = [doc._id, cookievalue].join('|');
            res.cookie('uuid', str);
            res.json({
                _id: doc._id,
                name: doc.name,
                email: doc.email,
                created: doc.created,
                updated: doc.updated
            })
        } else {
            res.status(400).json({
                status: 'error',
                error: "account is not exist."
            })
        }
    })
}

Account.prototype.auth = function(req, res, next) {

    var uuid = req.cookies.uuid && req.cookies.uuid.split('|');
    if (!uuid)
        return res.status(401).end();

    var userId = uuid[0],
        validateValue = uuid[1],
        COOKIE_SAFE = this.COOKIE_SAFE;

    this.mongo.findOne({
        _id: mongo.ObjectId(userId)
    }, function(error, doc) {
        if (error)
            res.status(500).end()
        else if (doc) {
            if (validateValue === crypto.createHash('md5').update(doc.passwd + COOKIE_SAFE).digest('hex').toUpperCase())
                (req.user = doc, req.user._id= req.user._id.toString(), next())
            else
                res.status(401).end();
        } else
            res.status(401).end();
    })
}

function Machine() {
    this.mongo = mongo.get('user').collection('machine');
}

Machine.prototype.validate = function(body) {

}

Machine.prototype.NewMachine = function(body) {

    this.validate(body);

    return {
        user_id: mongo.ObjectId(body.user_id),
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
    body.user_id = req.user._id;
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
        this.validate(body);
        body.updated = new Date();
    } catch (e) {
        return res.status(400).json({
            status: 'error',
            error: e.toString()
        })
    }

    this.mongo.update({
        _id: mongo.ObjectId(id)
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
        _id: mongo.ObjectId(id)
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
        _id: mongo.ObjectId(id)
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
        user_id: mongo.ObjectId(user_id)
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

Profile.prototype.BuildScript= function(){
    return "";
}

Profile.prototype.NewProfile = function(body) {

    this.validate(body);

    return {
        user_id: mongo.ObjectId(body.user_id),
        machine_id: mongo.ObjectId(body.machine_id),
        name: body.name,
        description: body.description,
        mem_use: body.mem_use,
        disk_use: body.disk_use,
        receive_use: body.receive_use,
        transport_use: body.transport_use,
        script: body.script || "",
        created: new Date(),
        updated: new Date()
    }
}

Profile.prototype.create = function(req, res) {
    var body = req.body;
    body.user_id = req.user._id;

    try {
        body = this.NewProfile(body);
    } catch (e) {
        return res.status(400).json({
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
        this.validate(body);
        body.updated = new Date();
    } catch (e) {
        return res.status(400).json({
            status: 'error',
            error: e.toString()
        })
    }

    this.mongo.update({
        _id: mongo.ObjectId(id)
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
        _id: mongo.ObjectId(id)
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
        _id: mongo.ObjectId(id)
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
    var user_id = req.user._id;
    var machine_id = req.params.machineId;
    var query = {
        user_id: mongo.ObjectId(user_id)
    };
    if (machine_id)
        query.machine_id = mongo.ObjectId(machine_id);

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