'use strict';
const util = require('util');
const request = require('request');
const FeedParser = require('feedparser');

function Daily() {

  this.host = 'https://en.wikipedia.org';
  this.data = {};
  this.endpoints = [];

  let i, ii,
      format = 'atom',
      api = this.host + '/w/api.php?action=featuredfeed&feed=%s&feedformat=%s';

  const feeds = [
    {
      name: 'potd',
      titleMatch: /^Wikipedia picture of the day/,
      bodyMatch: /<a.*?href="(\/wiki\/File\:.*?)".*?>/
    },
    {
      name: 'featured',
      titleMatch: /Wikipedia featured article$/,
      bodyMatch: /<b><a.*?>(.*?)<\/a><\/b>/
    }
  ];

  for (i=0,ii=feeds.length;i<ii;i++) {
    this.endpoints.push({
      done: false,
      feed: feeds[i],
      uri: util.format(api, feeds[i].name, format)
    });
  }

}

Daily.prototype.load = function() {

  const self = this;

  return new Promise(function(resolve, reject) {

    let i, ii;

    for (i=0,ii=self.endpoints.length;i<ii;i++) {

      self.read(self.endpoints[i]).then(function(response) {
        resolve(response);
      }, function(error) {
        reject(error);
      });

    }

  });

};

Daily.prototype.checkEndpoints = function () {

  let i, ii,
      r = true;

  for (i=0,ii=this.endpoints.length;i<ii;i++) {
    if (!this.endpoints[i].done) {
      r = false;
    }
  }

  return r;

};

Daily.prototype.getSearchDate = function() {

  let date = new Date(),
      year = date.getFullYear(),
      month = this.getMonth(date.getMonth()),
      day = this.getDate(date.getDate());

  return this.getFullDate(year, month, day);

};

Daily.prototype.getMonth = function(month) {
  if (month <= -1) {
    month = 0;
  }
  return (month + 1 < 10) ? '0' + (month + 1) : (month + 1);
};

Daily.prototype.getDate = function (date) {
  if (date <= 0) {
    date = 1;
  }
  return date < 10 ? '0' + date : date;
};

Daily.prototype.getFullDate = function (y,m,d,re) {

  let sep = (re) ? '\-' : '-';

  return [y, m, d].join(sep);

};

Daily.prototype.read = function (endpoint) {

  const self = this;

  return new Promise(function(resolve, reject) {

    const feedParser = new FeedParser();
    const req = request({
      method: 'get',
      uri: endpoint.uri
    });

    req.on('error', function(error) {
      // Do something
      reject(error);
    });

    req.on('response', function(feed) {
      var stream = this; // `this` is `req`, which is a stream

      if (feed.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'));
        reject(new Error('Bad status code'));
      } else {
        stream.pipe(feedParser);
      }

      feedParser.on('error', function (error) {
        // always handle errors
        reject(error);
      });

      feedParser.on('readable', function () {
        // This is where the action is!
        let item,
            pubDate,
            matches,
            stream = this,
            meta = this.meta;

        while (item = stream.read()) {
          pubDate = item.pubDate.toISOString().split('T')[0];
          console.log(self.getSearchDate(), pubDate);
          if (pubDate === self.getSearchDate()) {
            if (item.title.match(endpoint.feed.titleMatch)) {
              if (matches = item.summary.match(endpoint.feed.bodyMatch)) {
                self.data[endpoint.feed.name] = matches[1];
              }
            }
          }
        }
      });

      feedParser.on('end', function() {

        endpoint.done = true;

        if (self.checkEndpoints()) {
          resolve({
            host: self.host,
            date: self.getSearchDate(),
            data: self.data
          });
        }

      });

    });

  });

};

module.exports = Daily;