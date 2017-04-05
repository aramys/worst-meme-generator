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
      title = 'Worst Meme Generator',
      daily = new Daily(),
      generator = new Generator();

  if (req.params.date) {
    date = req.params.date;
    if (date === 'favicon.ico') {
      res.render('index', {});
      return;
    }
  }

  console.log('date', date);



  daily.load(date).then(function(response) {
    let files = generator.findByDate(date);

    if (files.length) {
      res.render('index', {
        title: title,
        body: generator.fileToMeme(files[0], response.entries)
      });
      return;
    }

    generator.wikipedia(response).then(function(o) {
      console.log(o);
      res.render('index', {
        title: title, 
        body: o
      });
    }, function(error) {
      res.render('index', { 
        title: title, 
        body: { 
          data: { 
            featured: 'No entry ' + ((date) ? 'for ' + date : ''), 
            potd: '' 
          }, 
          host: ''
        } 
      });
    });
  }, function(error) {
    console.log(error);
    res.render('index', { 
      title: title, 
      body: error 
    });
  });

});

module.exports = router;
