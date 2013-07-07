var fs = require('fs');
var express = require('express');

var app = express.createServer(express.logger());

var raw_buffer;
fs.readFile('/myrepo/bitstarter/index.html', function (err, data) {
    if(err) throw err;
    raw_buffer = data;
});

var content = raw_buffer.toString();

app.get('/', function(request, response) {
  response.send(content);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
