var express = require('express');
var request = require('request');
var FeedParser = require('feedparser');
var Daily = require('./../lib/daily');
var Generator = require('./../lib/generator');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  var daily = new Daily();
  var generator = new Generator();

  daily.load().then(function(response) {
    console.log(response);
    generator.wikipedia(response).then(function(o) {
      res.render('index', {title: 'Express', body: o});
    }, function(error) {
      res.render('index', { title: 'Express', body: { data: { featured: '', potd: '' }, host: ''} });
    });
  }, function(error) {
    console.log(error);
    res.render('index', { title: 'Express', body: error });
  });

});

module.exports = router;
