var nitrogen = require('nitrogen')
  , Store = require('nitrogen-static-store');

var config = {
    host: 'localhost',
    http_port: 3030,
    protocol: 'http'
};

config.store = new Store({
    'principal.mosaic': {
        type:        'app',
        id:          process.env.APP_ID,
        public_key:  process.env.APP_PUBLIC_KEY,
        private_key: process.env.APP_PRIVATE_KEY
    }
});

config.api_key = process.env.APP_API_KEY;

config.device_scope = [{
    actions: [ 'view', 'subscribe' ],
    filter: {
        $or: [
            { tags: 'sends:image' }
        ]
    }
}];

config.buildAuthorizationUri = function() {
    config.app_authorization_uri = config.endpoints.users + "/authorize?api_key=" + encodeURIComponent(config.api_key) +
        "&app_id=" + encodeURIComponent(process.env.APP_ID) +
        "&redirect_uri=" + encodeURIComponent(process.env.APP_URL) +
        "&scope=" + encodeURIComponent(JSON.stringify(config.device_scope));

    console.log(config.app_authorization_uri);
};

config.log_levels = ['info', 'warn', 'error'];

config.port = process.env.PORT || 3010;

module.exports = config;
