var mongo= require('./lib/mongo')
.on('ready', function () {
	console.log('init mongo ready.');
	var server = require('./lib/server');

}).init();