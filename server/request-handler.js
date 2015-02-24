var messages = {};
var all = [];

var getRoomName = function(url) {
  return url.substring(8);
};

var addMessage = function(message, request) {
  message = JSON.parse(message);
  all.push(message);
  var roomname = getRoomName(request.url);
  if (messages[roomname]) {
    messages[roomname].push(message);
  } else {
    messages[roomname] = [message];
  }
};

var getMessagesForUrl = function(url) {
  var roomname = getRoomName(url);
  if (roomname === "/messages") {
    return all;
  } else if (messages[roomname]) {
    return messages[roomname];
  } else {
    return [];
  }
};

var isGET = function(request) {
  return request.method === 'GET';
};

var handleGET = function (request, response) {
  var data = {
    results : getMessagesForUrl(request.url)
  };
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "application/json";
  response.writeHead(200, headers);
  response.end(JSON.stringify(data));
};

var isPOST = function(request) {
  return request.method === 'POST';
};

var handlePOST = function (request, response) {
  var message = '';
  request.on('data', function(data) {
    message += data;
  });
  request.on('end', function () {
    addMessage(message, request);
  });

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(201, headers);
  response.end();
};

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  if (request.method === 'OPTIONS') {
    response.writeHead(200, defaultCorsHeaders);
    response.end();
  }

  if (isGET(request)) {
    handleGET(request, response);

  } else if (isPOST(request)) {
    handlePOST(request, response);

  } else {
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    response.writeHead(404, headers);
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



