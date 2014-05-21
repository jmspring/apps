function CountAnalyzer(config) {
    this.twitter = config.twitter;
    this.query = config.query;
    this.measurementInterval = config.measurement_interval;
}

CountAnalyzer.dateSecondsFromNow = function(seconds) {
    return new Date(new Date().getTime() + seconds * 1000);
};

CountAnalyzer.prototype.getMeasurementCutoff = function() {
    return TwitterAnalyzer.dateSecondsFromNow(-1 * this.measurementInterval);
};

CountAnalyzer.prototype.update = function(session, callback) {
    var self = this;
    var metric = 0;

    this.twitter.search(this.query, { count: 100 }, function(results) {
        results.statuses.forEach(function(tweet) {
            if (new Date(Date.parse(tweet.created_at)) > self.getMeasurementCutoff())
                metric += 1;
        });

        session.log.info('metric: ' + metric);
        return callback(metric);
    });
};

module.exports = CountAnalyzer;