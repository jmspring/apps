var assert = require('assert')
  , config = require('../config')
  , nitrogen = require('nitrogen')
  , TimelapseApp = require('../../app');

describe('timelapse app', function() {

    var service = new nitrogen.Service(config);
    var camera = new nitrogen.Device({ nickname: 'testCam' });

    var getMessageCount = function(session, camera, callback) {
        setTimeout(function() {
            nitrogen.Message.find(session, { from: camera.id }, {}, function(err, messages) {
                assert.ifError(err);

                callback(messages.length);
            });
        }, 1000);
    };

    it('should start correctly', function(done) {
        service.connect(camera, function(err, session, camera) {
            var params = {
                camera_id: camera.id,
                latitude: 36.9,
                longitude: -122.09
            };

            var app = new TimelapseApp(session, params);

            app.start();

            getMessageCount(session, camera, function(count) {
                assert.notEqual(count, 0);

                app.start();

                getMessageCount(session, camera, function(newCount) {
                    assert.equal(count, newCount);

                    done();
                });
            });
        });
    });

});
