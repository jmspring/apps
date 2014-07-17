var CameraManager = require('nitrogen-camera')
  , RaspberryPiCamera = require('raspberrypi-camera');

function RaspberryPiCameraApp(session, params) {
    this.session = session;
    this.params = params;
}

RaspberryPiCameraApp.prototype.start = function() {
    var camera = new RaspberryPiCamera(this.session.principal);

    new CameraManager(camera).start(this.session, function(err, message) {
        if (err) return this.session.log.error(JSON.stringify(err));
    });
};

RaspberryPiCameraApp.prototype.stop = function() {
};

module.exports = RaspberryPiCameraApp;
