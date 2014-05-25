var assert = require('assert')
  , config = require('../config')
  , nitrogen = require('nitrogen')
  , SunsetApp = require('../../app');

describe('sunset shot app', function() {

    var service = new nitrogen.Service(config);
    var camera = new nitrogen.Device({ nickname: 'testCam' });

    var getMessageCount = function(session, camera, callback) {
        setTimeout(function() {
            nitrogen.Message.find(session, { from: camera.id }, {}, function(err, messages) {
                assert.ifError(err);

                callback(messages.length);
            });
        }, 500);
    };

    it('should start correctly', function(done) {
        service.connect(camera, function(err, session, camera) {
            var params = {
                camera_id: camera.id,
                latitude: 39.5,
                longitude: -110.0
            };

            var sunsetApp = new SunsetApp(session, params);

            sunsetApp.start();

            getMessageCount(session, camera, function(count) {
                assert.notEqual(count, 0);

                sunsetApp.start(session, params);

                getMessageCount(session, camera, function(newCount) {
                    assert.equal(count, newCount);

                    done();
                });
            });
        });
    });

});