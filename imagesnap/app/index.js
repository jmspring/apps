var CameraManager = require('nitrogen-camera')
  , ImageSnapCamera = require('nitrogen-imagesnap');

function ImageSnapCameraApp(session, params) {
    this.session = session;
    this.params = params;
}

ImageSnapCameraApp.prototype.start = function() {
    var camera = new ImageSnapCamera({
        nickname: 'camera',
        id: this.session.principal.id
    });

    new CameraManager(camera).start(this.session, function(err, message) {
        if (err) return this.session.log.error(JSON.stringify(err));
    });
};

ImageSnapCameraApp.prototype.stop = function() {
};

module.exports = ImageSnapCameraApp;