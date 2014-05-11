var nitrogen = require('nitrogen')
  , Store = require('nitrogen-leveldb-store');

var config = {
    host: 'localhost',
    http_port: 3030,
    protocol: 'http'
};

config.store = new Store(config);

config.api_key = 'xxx-xxx-xxx';

config.device_scope = [
    {
        actions: [ 'view', 'subscribe' ],
        filter: {
            $or: [
                { tags: 'sends:temperature' },
                { tags: 'sends:humidity' }
            ]
        }
    }
];

config.buildAuthorizeUri = function(app_id) {
    config.airpi_authorization_uri = config.endpoints.users + "/authorize?api_key=" + encodeURIComponent(config.api_key) +
          "&app_id=" + encodeURIComponent(app_id) +
          "&scope=" + encodeURIComponent(JSON.stringify(config.device_scope));
};

config.log_levels = ['info', 'warn', 'error'];

config.port = process.env.PORT || 3010;

module.exports = config;
