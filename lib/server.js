var express = require('express');
var bodyParser = require('body-parser');
var cookieParser= require('cookie-parser');
var useragent= require('express-useragent');
var app = express();
var user = require('./user');
var mission= require('./mission');
var process= require('./process');
var crawler= require('./crawler');

app.use(useragent.express()); // useragent
app.use(cookieParser()); // cookies
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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


//docker process
app.get('/process/:id', process.online.bind(user.process));
app.delete('/process/:id', process.offline.bind(user.process));
//crawler mission
app.get('/mission/:id', mission.start.bind(user.mission));
app.post('/mission/:id', mission.result.bind(user.mission));
// crawler content
app.get('/content/:id', crawler.get.bind(user.crawler));

app.listen(3000);
console.log('http server listen:', 3000);

module.exports= app;