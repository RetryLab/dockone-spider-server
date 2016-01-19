var express = require('express');
var bodyParser = require('body-parser');
var cookieParser= require('cookie-parser');
var useragent= require('express-useragent');
var app = express();
var user = require('./user');
var mission= require('./mission');
var docker= require('./docker');
var content= require('./content');
var store= require('./store');
var analysis= require('./analysis');
var config= require('../config');

app.use(useragent.express()); // useragent
app.use(cookieParser()); // cookies
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(function (req,res,next){
	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Headers','authorization,content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	next();
});
app.options('*', function (req, res, next){
	res.send(200);
});
// user account
app.put('/user/account', user.account.create.bind(user.account));
app.post('/user/account', user.account.login.bind(user.account));
app.all('/user/*', user.account.auth.bind(user.account))
// user machine
app.post('/user/machine', user.machine.create.bind(user.machine));
app.put('/user/machine/:id', user.machine.update.bind(user.machine));
app.get('/user/machine/:id', user.machine.get.bind(user.machine));
app.delete('/user/machine/:id', user.machine.delete.bind(user.machine));
app.get('/user/machines', user.machine.find.bind(user.machine));
// user profile
app.post('/user/profile', user.profile.create.bind(user.profile));
app.put('/user/profile/:id', user.profile.update.bind(user.profile));
app.get('/user/profile/:id', user.profile.get.bind(user.profile));
app.delete('/user/profile/:id', user.profile.delete.bind(user.profile));
app.get('/user/profiles/:machineId?', user.profile.find.bind(user.profile));
// analysis stats
app.get('/user/analysis/:machineId?/:profilesId?', analysis.find.bind(analysis));

//docker process
app.get('/docker/:authId?', docker.auth.bind(docker));
app.post('/docker/:id?', docker.online.bind(docker));
app.delete('/docker/:id', docker.offline.bind(process));
//crawler mission
app.get('/mission/:id', mission.start.bind(mission));
app.post('/mission/:id', mission.content.bind(mission));
app.put('/mission/:id', mission.links.bind(mission));
// crawler content
app.get('/content/:id', content.get.bind(content));
app.get('/contents', content.find.bind(content));
app.post('/contents', content.custom.bind(content));

app.listen(config.port);
console.log('http server listen:', config.port);

module.exports= app;