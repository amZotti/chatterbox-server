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

var isRoomURL = function(request) {
  return request.url.substring(0, 13) === '/classes/room';
};

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);

  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "application/json";

  if (request.method === 'OPTIONS') {
    response.writeHead(statusCode, headers);
    response.end();
  }

  // GET -- two urls, both of which return a set of messages
  // Separate routes from logic
  // Extract duplicate header setup -- put all the things in functions
  // /classes/room/roomname
  // /classes/messages

  var handleGET = function (request, response) {
    var data = {
      results : getMessagesForUrl(request.url)
    };
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
  };

  if (request.method === 'GET') {
    handleGET(request, response);
  } else if (!isRoomURL(request) && request.method === 'POST') {
    var message = '';
    request.on('data', function(data) {
      message += data;
    });
    request.on('end', function () {
      addMessage(message, request);
    });

    statusCode = 201;
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end();

  } else if (isRoomURL(request) && request.method === 'POST') {
    var message = '';
    request.on('data', function(data) {
      message += data;
    });
    request.on('end', function () {
      addMessage(message, request);
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

