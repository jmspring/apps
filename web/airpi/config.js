var nitrogen = require('nitrogen')
  , Store = require('nitrogen-static-store');

var config = {
};

config.store = new Store({
    'principal.airpi-visualization': {
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
            { tags: 'sends:temperature' },
            { tags: 'sends:humidity' }
        ]
    }
}];

config.buildAuthorizeUri = function(app_id) {
    config.airpi_authorization_uri = 'https://api.nitrogen.io/user/authorize?api_key=airpi-local&app_id=538f4d0b454a8a3e0427264c&redirect_uri=http%3A%2F%2Flocalhost%3A3010%2Findex.html&scope=%5B%7B"actions"%3A%5B"view"%2C"subscribe"%5D%2C"filter"%3A%7B"%24or"%3A%5B%7B"tags"%3A"sends%3Atemperature"%7D%2C%7B"tags"%3A"sends%3Ahumidity"%7D%5D%7D%7D%5D';

    //config.airpi_authorization_uri = config.endpoints.users + "/authorize?api_key=" + encodeURIComponent(config.api_key) +
    //      "&app_id=" + encodeURIComponent(app_id) +
    //      "&redirect_uri=" + encodeURIComponent(process.env.AIRPI_URL) +
    //      "&scope=" + encodeURIComponent(JSON.stringify(config.device_scope));
};

config.log_levels = ['info', 'warn', 'error'];

config.port = process.env.PORT || 3010;

module.exports = config;
