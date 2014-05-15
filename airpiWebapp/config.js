var nitrogen = require('nitrogen')
  , Store = require('nitrogen-leveldb-store');

var config = {
    host:       process.env.HOST,
    http_port:  process.env.HTTP_PORT,
    protocol:   process.env.PROTOCOL
};

config.store = new Store(config);

config.api_key = process.env.API_KEY;

config.device_scope = [{
    actions: [ 'view', 'subscribe' ],
    filter: {
        $or: [
            { tags: 'sends:temperature' },
            { tags: 'sends:humidity' }
        ]
    }
}];

config.buildAuthorizeUri = function(app_id) {
    config.airpi_authorization_uri = config.endpoints.users + "/authorize?api_key=" + encodeURIComponent(config.api_key) +
          "&app_id=" + encodeURIComponent(app_id) +
          "&redirect_uri=" + encodeURIComponent(process.env.AIRPI_URL) +
          "&scope=" + encodeURIComponent(JSON.stringify(config.device_scope));
};

config.log_levels = ['info', 'warn', 'error'];

config.port = process.env.PORT || 3010;

module.exports = config;