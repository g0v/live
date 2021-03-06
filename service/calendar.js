var https = require('https'),
    async = require('async'),
    fs = require('fs'),
    exec = require('child_process').exec;

var Firebase = require('firebase');
var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var time = require('time');

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var database = JSON.parse(fs.readFileSync('./database.json', 'utf8').replace(/\/\/[ \S]*/gi,''));
var now;

var db_firebase = new Firebase(database.host);
db_firebase.auth(database.token, function(error, result) {
  if(error) {
    console.log("Login Failed!", error);
  } else {
    console.log('Authenticated successfully with payload:', result.auth);
    console.log('Auth expires at:', new Date(result.expires * 1000));
  }
});

var events = {};

var parser = function (cb){
  now = new time.Date().setTimezone('Asia/Taipei');
  var date = new Date().toISOString().replace(/T.*/gi, '');

  var source = [
    'https://www.googleapis.com/calendar/v3/calendars/9dvlo755f8c5lbcs9eu9hfd1g0%40group.calendar.google.com/events?key=AIzaSyBqSFbeQLYKQl80FblMuj682zvpbpPVG_o&timeZone=Asia/Taipei&timeMin=' + date + 'T00:00:00.000Z',
    'https://www.googleapis.com/calendar/v3/calendars/s6jage479tquhj3mr7abhecs48%40group.calendar.google.com/events?key=AIzaSyBqSFbeQLYKQl80FblMuj682zvpbpPVG_o&timeZone=Asia/Taipei&timeMin=' + date + 'T00:00:00.000Z'
  ];

  async.map(source, function(url, cb){
    https.get(url, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        var list = JSON.parse(body).items || [];
        cb(null, list);
      });
    }).on('error', function(e) {
      cb(null, []);
    });
  }, function(err, results){
    var events = {};
    results.forEach(function(list){
      list.forEach(function(item){
        events[item.id] = {
          'day': item.start.dateTime ? false : true,
          'start': item.start.dateTime || item.start.date + 'T00:00:00+08:00',
          'end': item.end.dateTime || item.end.date + 'T00:00:00+08:00',
          'title': item.summary,
          'location': item.location,
          'link': item.htmlLink
        };
      });
    });
    db_firebase.child('event').set(events, cb);
  });
};

var running = false;
var run = function() {
    if (running !== false) {
        return ;
    }

    running = true;

    console.log(new time.Date().setTimezone('Asia/Taipei').toLocaleTimeString(), 'start');
    parser(function () {
        console.log(new time.Date().setTimezone('Asia/Taipei').toLocaleTimeString(), 'end');
        running = false;
    });
}

parser();

setInterval(run, 20 * 60 * 1000);