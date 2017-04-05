'use strict';
const request = require('request');
const fs = require('fs');

function Generator() {
}

Generator.prototype.memeToFile = function(name, date, ext) {
  return name.toLowerCase().replace(/[\s\t\n]+/g,'_') + '_' + date + '.' + ext;
};

Generator.prototype.fileToMeme = function(file) {

  let parts = file.split('_'),
      dateExt = parts.pop().split('.'),
      date = dateExt[0],
      ext = dateExt[1],
      name = parts.join(' ').toUpperCase();

  return {
    name: name,
    date: date,
    ext: ext
  };

};

Generator.prototype.wikipedia = function (o) {

  let self = this;

  return new Promise(function(resolve, reject) {

    const memeReq = request({
      method: 'get',
      uri: 'http://speaklolcat.com/?from=' + encodeURIComponent(o.data.featured)
    }, function (err, response, body) {
      let matches;

      if (!err && response.statusCode === 200) {

        matches = body.match(/<textarea.*?id="to".*?>(.*?)<\/textarea>/i);

        if (matches) {
          o.meme = matches[1];
        }

        const req = request({
          method: 'get',
          uri: o.host + o.data.potd
        }, function(err, response, body) {
          let matches;

          if (!err && response.statusCode === 200) {
            if (matches = body.match(/<div class="fullMedia">.*?<a href="(.*?)".*?>/)) {

              let parts = matches[1].split('.'),
                ext = parts[parts.length - 1],
                fileName = self.memeToFile(o.data.featured, o.date, ext),
                imageUri = /^https?:\/\//.test(matches[1]) ? matches[1] : 'https:' + matches[1],
                filePath = ['', '/public/images/memes/' + fileName].join('.'),
                fileUri = filePath.replace("/public", "");

              fs.exists(filePath, function(exists) {
                o.file = fileUri;

                if (exists) {
                  resolve(o);
                }else{
                  const imgReq = request({
                    method: 'get',
                    uri: imageUri
                  }).on('error', function (err) {
                    reject(err);
                  }).on('end', function () {
                    console.log('generator', o);
                    resolve(o);
                  }).pipe(fs.createWriteStream(filePath));
                }
              });

            }else{
              reject(new Error("No image found"));
            }
          }else{
            reject(err);
          }
        });

      }else{
        reject(err);
      }
    });

  });

};

module.exports = Generator;