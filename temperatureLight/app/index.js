var nitrogen = require('nitrogen');

function TemperatureLight(session, params) {
    this.session = session;
    this.params = params;
}

TemperatureLight.prototype.computeHueFromTemp = function(temp) {
    temp = Math.min(temp, this.params.min_temp || 10.0);
    temp = Math.max(temp, this.params.max_temp || 30.0);
    this.session.log.info('temp for hue: ' + temp);

    return Math.floor(46920 - 4692 * temp);
};

TemperatureLight.prototype.start = function() {
    var self = this;

    ['light_id', 'thermometer_id'].forEach(function(key) {
        if (!self.params[key]) {
            self.session.log.error('required parameter ' + key +' not supplied.');
            return process.exit(0);
        }
    });

    this.session.onMessage({ from: this.params.thermometer_id, type: 'temperature' }, function(message) {
        self.session.log.info('received temp value: ' + message.body.temperature);

        var hue = self.computeHueFromTemp(message.body.temperature);

        self.session.log.info('--> hue: ' + hue);

        new nitrogen.Message({
            type: 'lightCommand',
            to: self.params.light_id,
            tags: [ nitrogen.CommandManager.commandTag(self.session) ],
            body: {
              on: true,
              bri: 255,
              hue: hue,
              sat: 255
            }
        }).send(self.session);
    });
};

TemperatureLight.prototype.stop = function() {
};

module.exports = TemperatureLight;