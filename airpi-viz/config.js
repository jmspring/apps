var nitrogen = require('nitrogen')
  , Store = require('nitrogen-leveldb-store');

var config = {
    host: 'localhost',
    http_port: 3030,
    protocol: 'http'
};

config.store = new Store(config);

config.log_levels = ['info', 'warn', 'error'];

config.port = process.env.PORT || 3010;

module.exports = config;
