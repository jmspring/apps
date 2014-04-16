var nitrogen = require('nitrogen')
  , SunCalc = require('suncalc');

var session;
var params;
var checkInterval;

var START_DEGREES = 3.0;
var FINISH_DEGREES = -3.0;
var DEGREES_PER_SHOT = 0.5;

var SHOTS = (START_DEGREES - FINISH_DEGREES) / DEGREES_PER_SHOT;

var currentShots = {};

function SunsetApp(session, params) {
    this.session = session;
    this.params = params;
}

SunsetApp.prototype.fetchCurrentShots = function(callback) {
    currentShots = {};

    nitrogen.Message.find(session, { type: 'cameraCommand', to: this.params.camera_id }, {}, function(err, commands) {
        if (err) return callback(err);

        commands.forEach(function(cameraCommand) {
            currentShots[cameraCommand.ts.toString()] = cameraCommand;
        });

        return callback();
    });
};

SunsetApp.prototype.setupSunsetShots = function() {
    var shot;
    for (shot=0; shot <= SHOTS; shot++) {
        SunCalc.addTime(START_DEGREES - DEGREES_PER_SHOT * shot, 'sunrise' + shot, 'sunset' + shot);
    }
};

SunsetApp.prototype.checkShot = function(shotTime, shotTag) {
    if (!currentShots[shotTime.toString()]) {
        // expire the camera command if not taken within 15 minutes.
        var expireTime = new Date(shotTime.getTime() + 15 * 60 * 1000);

        var cmd = new nitrogen.Message({
              to: params.camera_id,
              type: 'cameraCommand',
              ts: shotTime,
              expires: expireTime,
              body: {
                  command: 'snapshot',
                  message: {
                      tags: [shotTag]
                  }
              }
        });

        session.log.info('adding sunset shot at: ' + cmd.ts.toString());
        cmd.send(session);
    } else {
        session.log.debug('already have sunset shot at: ' + shotTime.toString());
    }
};

SunsetApp.prototype.checkShotsDaysOut = function(daysOut) {
    var date = new Date();
    date.setDate(new Date().getDate() + daysOut);

    var times = SunCalc.getTimes(date, this.params.latitude, this.params.longitude);

    var shot;
    for (shot=0; shot <= SHOTS; shot++) {
        var degrees = START_DEGREES - DEGREES_PER_SHOT * shot;
        if (degrees >= 0)
            degrees = "+" + degrees;

        var shotTag = 'sunset' + degrees;
        this.checkShot(times['sunset' + shot], shotTag);
    }
};

SunsetApp.prototype.checkShots = function() {
    var daysOut;
    var self = this;

    this.fetchCurrentShots(function(err) {
        if (err) return self.session.log.error('fetching current shots failed: ' + err);

        for (daysOut=0; daysOut <= 1; daysOut++) {
            checkShotsDaysOut(daysOut);
        }
    });
};

SunsetApp.prototype.start = function() {
    var self = this;

    ['camera_id', 'latitude', 'longitude'].forEach(function(key) {
        if (!self.params[key]) {
            session.log.error('required parameter ' + key +' not supplied.');
            return process.exit(0);
        }
    });

    this.setupSunsetShots();

    this.checkShots();
    checkInterval = setInterval(function() { self.checkShots(); }, 24 * 60 * 60 * 1000);
};

SunsetApp.prototype.stop = function() {
    clearInterval(checkInterval);
};

module.exports = SunsetApp;