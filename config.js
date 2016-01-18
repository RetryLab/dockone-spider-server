var config= require('./config.json');
var log4js = require('log4js');
var _ = require('underscore');

module.exports= _.extend(config, {
	log4js_configure: {
		appenders: [{
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: "%d{ABSOLUTE} %[%-5p%] %c %m"
            }
        }],
        "levels": {
            "[all]": "ERROR|INFO|LOG",
        }
	}
    , hostname: process.env['hostname'] || config.hostname
    , redis: process.env['redis'] || config.redis
    , elasticsearch: process.env['elasticsearch'] || config.elasticsearch
    , mongodb: process.env['mongodb'] || config.mongodb
})

log4js.configure( module.exports.log4js_configure);
