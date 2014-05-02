var nitrogen = require('nitrogen')
  , SunCalc = require('suncalc');

function Timelapse(session, params) {
    this.session = session;
    this.params = params;
}

Timelapse.prototype.sendShot = function() {
    var now = new Date();
    var self = this;

    if (this.params.latitude && this.params.longitude && this.params.only_daytime) {
        var times = SunCalc.getTimes(now, this.params.latitude, this.params.longitude);

        console.log('sunset: ' + times['sunset'].getTime());
        console.log('sunrise: ' + times['sunrise'].getTime());
        console.log('now: ' + now.getTime());

        if (times['sunset'].getTime() < now.getTime()) {
            console.log('after sunset, skipping.');
            return;
        }

        if (now.getTime() < times['sunrise'].getTime()) {
            console.log('before sunrise, skipping.');
            return;
        }
    }

    var shot = new nitrogen.Message({
       to: this.params.camera_id,
       tags: [ nitrogen.CommandManager.commandTag(this.params.camera_id) ],
       type: 'cameraCommand',
       expires: new Date(now.getTime() + 0.5 * this.params.period * 1000),
       body: {
           command: 'snapshot',
           message: {
               tags: ['timelapse']
           }
       }
    });

    this.session.log.info('timelapse: sending shot: ' + JSON.stringify(shot));

    shot.send(this.session, function(err, shot) {
        if (err) return self.session.log.info('timelapse: error sending shot: ' + JSON.stringify(err));

        self.session.log.info('timelapse: shot sent.');
    });
};

Timelapse.prototype.start = function() {
    var self = this;

    ['camera_id'].forEach(function(key) {
        if (!self.params[key]) {
            self.session.log.error('required parameter ' + key +' not supplied.');
            return process.exit(0);
        }
    });

    this.params.period = this.params.period || 15 * 60 * 1000;

    // we want to know when the sun is 0 degrees above the horizon both for sunrise and sunset.
    SunCalc.addTime(0.0, 'sunrise', 'sunset');

    this.sendShot();
    this.checkInterval = setInterval(function() {
        self.session.log.info('timelapse: periodic interval fired.');
        self.sendShot();
    }, this.params.period);
};

Timelapse.prototype.stop = function() {
    clearInterval(this.checkInterval);
};

module.exports = Timelapse;