var assert = require('assert')
  , config = require('../config')
  , nitrogen = require('nitrogen')
  , Matcher = require('../../app');

describe('matcher agent app', function() {

    var service = new nitrogen.Service(config);
    var servicePrincipal = new nitrogen.Principal({ type: 'service', nickname: 'service' });

    it('should start correctly', function(done) {
        service.connect(servicePrincipal, function(err, session, servicePrincipal) {

            var matcher = new Matcher(session, {});

            matcher.start();
            done();
        });
    });
});