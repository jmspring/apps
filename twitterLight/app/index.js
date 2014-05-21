var nitrogen = require('nitrogen')
  , Twitter = require('twitter')
  , CountAnalyzer = require('./countAnalyzer');
  , TwitterAnalyzer = require('./twitterAnalyzer');

function TwitterLight(session, params) {
    this.session = session;
    this.params = params;
}

TwitterLight.prototype.computeHueFromMetric = function(metric) {
    metric = Math.min(metric, 10.0);
    metric = Math.max(metric, 0.0);
    this.session.log.info('final metric: ' + metric);

    return Math.floor(46920 - 4692 * metric);
};

TwitterLightApp.prototype.update = function() {
    var self = this;

    tweetAnalyzer.update(this.session, function(metric) {

        var hue = self.computeHueFromMetric(metric);

        self.session.log.info('final hue value of: ' + hue);

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

TwitterLightApp.prototype.start = function() {
    var self = this;

    ['twitter_consumer_key',
     'twitter_consumer_secret',
     'twitter_access_token_key',
     'twitter_access_token_secret',
     'light_id',
     'twitter_query',
     'measurement_interval',
     'update_interval'].forEach(function(key) {
        if (!self.params[key]) {
            self.session.log.error('required parameter ' + key +' not supplied.');
            return process.exit(0);
        }
    });

    twitter = new Twitter({
        consumer_key:         this.params.twitter_consumer_key,
        consumer_secret:      this.params.twitter_consumer_secret,
        access_token_key:     this.params.twitter_access_token_key,
        access_token_secret:  this.params.twitter_access_token_secret,
    });

    tweetAnalyzer = new CountAnalyzer({
        twitter:              twitter,
        query:                this.params.twitter_query,
        measurement_interval: this.params.measurement_interval
    });

    this.update();
    this.fetchInterval = setInterval(function() {
      self.update();
    }, this.params.update_interval * 1000);
};

TwitterLightApp.prototype.stop = function() {
    clearInterval(this.fetchInterval);
};

module.exports = TwitterLightApp;