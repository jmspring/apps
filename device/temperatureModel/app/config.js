var nitrogen = require('nitrogen'),
    Store = require('nitrogen-leveldb-store');


// By default, run against the hosted Nitrogen service in the cloud.  Uncomment the lines below
// to run against a locally running service.

var config = {
//    host: 'localhost',
//    http_port: 3030,
//    protocol: 'http',
    api_key: process.env.API_KEY
};

config.store = new Store(config);

config.log_levels = ['debug', 'info', 'warn', 'error'];

module.exports = config;