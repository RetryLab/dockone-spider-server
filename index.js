var express = require('express');
var bodyParser = require('body-parser');
var cookieParser= require('cookie-parser');
var useragent= require('express-useragent');
var app = express();
var user = require('./lib/user');
var mission= require('./lib/mission');
var process= require('./lib/process');
var crawler= require('./lib/crawler');

app.use(useragent.express()); // useragent
app.use(cookieParser()); // cookies
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// user account
app.put('/user/account', user.account.create);
app.post('/user/account', user.account.login);
app.all('/user/*', user.account.auth)
// user machine
app.put('/user/machine', user.machine.create);
app.post('/user/machine/:id', user.machine.update);
app.get('/user/machine/:id', user.machine.get);
app.delete('/user/machine/:id', user.machine.delete);
// user profile
app.put('/user/profile', user.profile.create);
app.post('/user/profile', user.profile.update);
app.get('/user/profile', user.profile.get);
app.delete('/user/profile', user.profile.delete);


//docker process
app.get('/process/:id', process.online);
app.delete('/process/:id', process.offline);
//crawler mission
app.get('/mission/:id', mission.start);
app.post('/mission/:id', mission.result);
// crawler content
app.get('/content/:id', crawler.get);

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);
