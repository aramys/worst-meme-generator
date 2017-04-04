'use strict';
var express = require('express');
var request = require('request');
var FeedParser = require('feedparser');
var Daily = require('./../lib/daily');
var Generator = require('./../lib/generator');

var router = express.Router();

/* GET home page. */
router.get('/:date*?', function(req, res, next) {

  var date,
      daily = new Daily(),
      generator = new Generator();

  if (req.params.date) {
    date = req.params.date;
  }

  daily.load(date).then(function(response) {
    console.log(response);
    generator.wikipedia(response).then(function(o) {
      console.log(o);
      res.render('index', {title: 'Express', body: o});
    }, function(error) {
      res.render('index', { title: 'Express', body: { data: { featured: 'No entry ' + ((date) ? 'for ' + date : ''), potd: '' }, host: ''} });
    });
  }, function(error) {
    console.log(error);
    res.render('index', { title: 'Express', body: error });
  });

});

module.exports = router;
