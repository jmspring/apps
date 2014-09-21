var TemperatureModelDevice = require('nitrogen-model-temperature')
  , SensorManager = require('nitrogen-sensor');

function TemperatureModel(session, params) {
    this.session = session;
    this.params = params;
}

TemperatureModel.prototype.start = function() {
    this.device = new TemperatureModelDevice(this.session.principal);
    this.manager = new SensorManager(this.device).start(this.session);
};

TemperatureModel.prototype.stop = function() {
};

module.exports = TemperatureModel;