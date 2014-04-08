var CameraManager = require('nitrogen-camera')
  , FSWebcamCamera = require('fswebcam');

function FSWebcamCameraApp(session, params) {
    this.session = session;
    this.params = params;
}

FSWebcamCameraApp.prototype.start = function() {
    var camera = new FSWebcamCamera({
        nickname: 'camera',
        id: this.session.principal.id
    });

    new CameraManager(camera).start(this.session, function(err, message) {
        if (err) return this.session.log.error(JSON.stringify(err));
    });
};

FSWebcamCameraApp.prototype.stop = function() {
};

module.exports = FSWebcamCameraApp;
