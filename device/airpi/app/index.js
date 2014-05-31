var AirPiDevice = require('nitrogen-airpi')
  , SensorManager = require('nitrogen-sensor');

function AirPi(session, params) {
    this.session = session;
    this.params = params;
}

AirPi.prototype.start = function() {
    this.device = new AirPiDevice(this.session.principal);
    this.manager = new SensorManager(this.device).start(this.session);
};

AirPi.prototype.stop = function() {
};

module.exports = AirPi;