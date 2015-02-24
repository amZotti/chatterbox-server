var app = {};
$(document).ready(function() {
// YOUR CODE HERE:
  app.server = "https://api.parse.com/1/classes/chatterbox";
  app.initialLoad = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  app.messages = [];
  app.rooms = [];
  app.username = '';
  app.currentRoom = '';
  app.friends = {};

  app.init = function() {

    app.fetch();
  };

  app.redisplay = function () {
    $('.messages').html('');
    app.displayMessages(app.messages);
  };

  app.send = function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message');
      }
    });

  };

  //Display Code
  app.displayMessages = function (undisplayedMessages) {
    var messageContainer = $('.messages');

    if (app.currentRoom) {
      undisplayedMessages = _.filter(undisplayedMessages, function(message) {
        return message.roomname === app.currentRoom;
      });
    }

    _.each(undisplayedMessages, function (message) {

      var $user = $('<span class="username"></span>');
      $user.text(message.username);

      var time = message.date;
      var $timestamp = $('<span class="timestamp"></span>');
      $timestamp.text(time.toLocaleDateString() + ' ' + time.toLocaleTimeString());

      // var $id = $('<span></span>');
      // $id.text(message.objectId);

      var $messageHtml = $('<div class="message-text"></div>');
      $messageHtml.text(message.text).html();

      //add friend-message class to message text div if user is a friend

      if (app.friends[message.username]) {
        $messageHtml.addClass('friend-message');
      }

      var $fullMessage = $('<div class="chat"></div>');
      $fullMessage.append($user);
      $fullMessage.append($timestamp);
      // $fullMessage.append($id);
      $fullMessage.append($messageHtml);
      messageContainer.prepend($fullMessage);
    });
  };


  // Get our data
  // Expect response to be:
  //  { results:
  //      [ { keys are: createdAt, objectId, roomname, text, updatedAt, username}, ...]
  //  }
  //  restrict with url + '?' + $.param({where: {createdAt: {__type: 'Date', iso: message.createdAt}}, ... }})

  app.fetch = function() {
    var fetchFrom = app.messages.length > 0
                            ? app.messages[app.messages.length - 1].createdAt
                            : app.initialLoad;
    var params =  $.param({
      where: {
        createdAt: {
          $gt: {
            __type: 'Date',
            iso: fetchFrom
          }
        }
      }
    });

    $.get(app.server, params, function (response) {
      // console.log(response);
      var results = _.filter(response.results, function(message) {
        return message.text !== undefined && message.username !== undefined;
      });
      _.each(results, function (message) {
        message.date = new Date(message.createdAt);
      });
      results.sort(function (a, b) {
        if (a.date < b.date) {
          return -1;
        } else if (a.date > b.date) {
          return 1;
        } else {
          return 0;
        }
      });
      app.messages = app.messages.concat(results);
      app.displayMessages(results);

      var newRooms = _.pluck(results, 'roomname');
      newRooms = _.filter(newRooms, function (room) {
        return room; //filter undefined and empty string
      });
      app.rooms = _.uniq(app.rooms.concat(newRooms));
      app.updateRooms();
    });
    setTimeout(app.fetch, 5000);
  };

  app.updateRooms = function () {
    var $rooms = $('.rooms');
    $rooms.html('');
    _.each(app.rooms, function (room) {
      var $room = $('<li></li>');
      $room.text(room);
      if (room === app.currentRoom) {
        $room.addClass('current-room');
      }
      $rooms.append($room);
    });
  };

  $('.chat-form').on('submit', function(event) {
    event.preventDefault();
    var $inputText = $('.new-message-text');
    var message = {
      text: $inputText.val(),
      username: app.username,
      roomname: app.currentRoom || undefined
    };
    $inputText.val('');
    app.send(message);
  });


  $('.username-link').on('click', function (event) {
    event.preventDefault();

    $usernameLink = $(this);
    $usernameLink.hide();

    var $container = $('.login-container');
    var $usernameForm = $(
      '<form>' +
      '<input type="text" class="username-input" placeholder="Enter user name"/>' +
      '<button type="submit">Log in</button>' +
      '</form>'
      );

    $container.append($usernameForm);

    $usernameForm.on('submit', function (event) {
      event.preventDefault();
      app.username = $('.username-input').val()
      $(this).remove();
      $usernameLink.text(app.username);
      $usernameLink.show();
    });
  });

  var $rooms = $('.rooms');
  $rooms.on('click', 'li', function(event) {
    event.preventDefault();
    if (app.currentRoom) {
      //remove class from current room
      $('.current-room').removeClass('current-room');
    }
    app.currentRoom = $(this).text();
    $(this).addClass('current-room');
    app.redisplay();
  });

  $('.new-room-form').on('submit', function (event) {
    event.preventDefault();
    app.currentRoom = $('.new-room-name').val();
    $('.new-room-name').val('');
    app.rooms.push(app.currentRoom);
    app.updateRooms();
    app.redisplay();
  });

  $('.messages').on('click', '.username', function (event) {
    event.preventDefault();
    var friend = $(this).text();
    app.friends[friend] = !app.friends[friend];
    app.redisplay();
  });

  $('.home').on('click', function (event) {
    if (app.currentRoom) {
      $('.current-room').removeClass('current-room');
    }
    app.currentRoom = '';
    app.redisplay();
  });

  app.init();
});
