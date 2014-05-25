var nitrogen = require('nitrogen')
  , Store = require('nitrogen-memory-store');
   
var config = { 
    host: "localhost",
    protocol: "http",
    http_port: 3030
};

config.store = new Store(config);

module.exports = config;
