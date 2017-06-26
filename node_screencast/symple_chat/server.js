
'use strict';
var http = require('http');
var fs =  require('fs');
var url = require('url');
var chat = require('./chat');
var port = process.env.port || 1337;

function sendFile(fileName, res) {
  var fileStream = fs.createReadStream(fileName);
  fileStream
    .on('error', function () {
      res.statusCode = 500;
      res.end('server error');
    })
};

http.createServer(function (req, res) {
    switch (req.url) {
      case '/':
            sendFile('index.html', res);
            break;
      case '/subscribe':
            chat.subscribe(req, res);
            break;
      case '/publish':
            var body = '';

            req
              .on('readable', function () {
                body += req.read();
                if (body.length > 1e4) {
                  res.statusCode = 413;
                  res.end('message is too big');
                }
              })
              .on('end', function () {
                try {
                  body = JSON.parse(body);
                } catch (e) {
                  res.statusCode = 400;
                  res.end('bad request');
                  return;
                }
                chat.publish(body.message);
                res.end('ok');
              });
            break;
      default:
        res.statusCode = 404;
        res.end('not found');

    };

}).listen(port, console.log('Server running on port ' + port));
