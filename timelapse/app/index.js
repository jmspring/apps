var nitrogen = require('nitrogen')
  , SunCalc = require('suncalc');

function TimelapseApp(session, params) {
    this.session = session;
    this.params = params;
}

TimelapseApp.prototype.fetchCurrentShots = function(callback) {
    var self = this;
    this.currentShots = {};

    // TODO: use command tags to narrow search further.
    nitrogen.Message.find(this.session, { type: 'cameraCommand', to: this.params.camera_id }, {}, function(err, commands) {
        if (err) return callback(err);

        commands.forEach(function(cameraCommand) {
            self.currentShots[cameraCommand.ts.getTime()] = cameraCommand;
        });

        return callback();
    });
};

TimelapseApp.prototype.checkShot = function(shotTime, shotTag) {

   var cmd = new nitrogen.Message({
       to: this.params.camera_id,
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

    if (!this.currentShots[cmd.ts.getTime()]) {
        // expire the camera command if not taken within 15 minutes.
        var expireTime = new Date(shotTime.getTime() + 15 * 60 * 1000);

        this.session.log.info('adding shot at: ' + cmd.ts.getTime() + ": " + cmd.ts.toString());
        cmd.send(this.session);
    }
};


TimelapseApp.prototype.checkShotsDaysOut = function(daysOut) {
    var date = new Date();
    date.setDate(new Date().getDate() + daysOut);

    var times = SunCalc.getTimes(date, this.params.latitude, this.params.longitude);
    var difference = times['sunset'].getTime() - times['sunrise'].getTime();
    var shotIncrement = difference / this.params.shots_per_day;

    for (var shot=0; shot <= this.params.shots_per_day; shot++) {
        var shotTime = new Date(times['sunrise'].getTime() + shotIncrement * shot);
        this.checkShot(shotTime, 'timelapse');
    }
}

TimelapseApp.prototype.checkShots = function() {
    var daysOut;
    var self = this;

    this.fetchCurrentShots(function(err) {
        if (err) return self.session.log.error('fetching current shots failed: ' + err);

        for (daysOut=0; daysOut <= 1; daysOut++) {
            self.checkShotsDaysOut(daysOut);
        }
    });
};

TimelapseApp.prototype.start = function() {
    var self = this;

    ['camera_id', 'latitude', 'longitude'].forEach(function(key) {
        if (!self.params[key]) {
            self.session.log.error('required parameter ' + key +' not supplied.');
            return process.exit(0);
        }
    });

    this.params.shots_per_day = this.params.shots_per_day || 20;

    // we want to know when the sun is 0 degrees above the horizon both for sunrise and sunset.
    SunCalc.addTime(0.0, 'sunrise', 'sunset');

    this.checkShots();
    this.checkInterval = setInterval(function() { self.checkShots(); }, 24 * 60 * 60 * 1000);
};

TimelapseApp.prototype.stop = function() {
    clearInterval(this.checkInterval);
};

module.exports = TimelapseApp;
