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

                console.log("messages: " + JSON.stringify(messages));

                callback(messages.length);
            });
        }, 1000);
    };

    it('should start correctly', function(done) {
        service.connect(camera, function(err, session, camera) {
            var params = {
                camera_id: camera.id
            };

            var app = new TimelapseApp(session, params);

            app.start();

            getMessageCount(session, camera, function(count) {
                assert.notEqual(count, 1);

                done();
            });
        });
    });

});
