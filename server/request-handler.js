
var messages = []


var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;
  var headers = defaultCorsHeaders;
  var data = {
    results: messages
  };

  if (request.url === '/classes/messages' && request.method === 'GET') {

    headers['Content-Type'] = "application/json";
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));

  } else if (request.url === '/classes/messages' && request.method === 'POST') {
    request.on('data', function(data) {
      messages.push(JSON.parse(data));
    });
    statusCode = 201;
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end();

  } else {

    statusCode = 404;
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end('could not query request');

  }

};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

module.exports = requestHandler;

