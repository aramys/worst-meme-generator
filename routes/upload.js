const express = require('express');
const fs = require('fs');

var router = express.Router();

/* GET users listing. */
router.post('/', function(req, res, next) {

  let path = process.cwd() + '/public/images/memes/' + req.body.generator + '/';

  if (req.body.image.match(/^data:image.*/)) {
    fs.exists(path, function(exists) {
      if (!exists) {
        fs.mkdirSync(path);
      }

      let parts = req.body.file.split('/'),
          filePath = path + parts[parts.length - 1],
          base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");

      console.log(path + parts[parts.length - 1], req.body.image, true);

      fs.writeFile(filePath, base64Data, 'base64', function(err) {
        console.log(err);
        if (err) {
          res.send('failed');
          throw err;
        }
        res.send('success');
      });


    });
  }
});

module.exports = router;
