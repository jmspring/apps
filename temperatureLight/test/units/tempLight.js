var assert = require('assert')
  , config = require('../config')
  , nitrogen = require('nitrogen')
  , TempLightApp = require('../../app');

describe('temperature-light app', function() {

    var service = new nitrogen.Service(config);
    var appPrincipal = new nitrogen.Principal({ nickname: 'app', type: 'app' });

   it('should start correctly', function(done) {
        service.connect(appPrincipal, function(err, session, appPrincipal) {
            var params = {
                light_id: "3939393",
                thermometer_id: "3993923"
            };

            var app = new TempLightApp(session, params);

            app.start();
            done();
        });
    });

});
