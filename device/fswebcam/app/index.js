var CameraManager = require('nitrogen-camera')
  , FSWebcamCamera = require('fswebcam');

function FSWebcamCameraApp(session, params) {
    this.session = session;
    this.params = params;
}

FSWebcamCameraApp.prototype.start = function() {
    var camera = new FSWebcamCamera(this.session.principal);
    var self = this;

    new CameraManager(camera).start(this.session, function(err, message) {
        if (err) return self.session.log.error(JSON.stringify(err));
    });
};

FSWebcamCameraApp.prototype.stop = function() {
};

module.exports = FSWebcamCameraApp;
