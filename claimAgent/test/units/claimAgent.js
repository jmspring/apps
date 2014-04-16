var assert = require('assert')
  , config = require('../config')
  , nitrogen = require('nitrogen')
  , ClaimAgent = require('../../app');

describe('claim agent app', function() {

    var service = new nitrogen.Service(config);
    var servicePrincipal = new nitrogen.Principal({ type: 'service', nickname: 'service' });

    it('should start correctly', function(done) {
        service.connect(servicePrincipal, function(err, session, servicePrincipal) {

            var claimAgent = new ClaimAgent(session, {});

            claimAgent.start();

	    var message = new nitrogen.Message({
                type: 'claim',
                body: {
                    claim_code: "XXXX-1111"
                }
            });

            claimAgent.process(message);

            done();
        });
    });
});
