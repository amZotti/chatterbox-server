var http = require("http");
var handleRequest = require('./request-handler.js');

var port = 3000;
var ip = "127.0.0.1";

var server = http.createServer(handleRequest);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);
