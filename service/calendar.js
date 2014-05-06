var https = require('https'),
    async = require('async'),
    fs = require('fs'),
    exec = require('child_process').exec;
var time = require('time');
    
var Parse = require('parse').Parse;
var Firebase = require('firebase');
var graph = require('fbgraph');

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var cfg = require('./database.json');
var now;

Parse.initialize(cfg.live.appid, cfg.live.key, cfg.live.master);
Parse.Cloud.useMasterKey();
var Fbevent = Parse.Object.extend("fbevent");
var query = new Parse.Query(Fbevent);

graph.setAccessToken(cfg.fbevent.fbtoken);

var liveDB = new Firebase(cfg.release.host);
liveDB.auth(cfg.release.token, function(error, result) {
  if(error) {
    console.log("Login Failed!", error);
  } else {
    console.log('Authenticated successfully with payload:', result.auth);
    console.log('Auth expires at:', new Date(result.expires * 1000));
  }
});

var parser = function (cb){
  now = new time.Date().setTimezone('Asia/Taipei');
  var date = new Date().toISOString().replace(/T.*/gi, '');

  var source = [
    'https://www.googleapis.com/calendar/v3/calendars/9dvlo755f8c5lbcs9eu9hfd1g0%40group.calendar.google.com/events?key=AIzaSyBqSFbeQLYKQl80FblMuj682zvpbpPVG_o&timeZone=Asia/Taipei&timeMin=' + date + 'T00:00:00.000Z',
    'https://www.googleapis.com/calendar/v3/calendars/s6jage479tquhj3mr7abhecs48%40group.calendar.google.com/events?key=AIzaSyBqSFbeQLYKQl80FblMuj682zvpbpPVG_o&timeZone=Asia/Taipei&timeMin=' + date + 'T00:00:00.000Z'
  ];

  async.parallel({
      'google': function(cb){
        async.map(source, function (url, cb) {
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
        }, cb);
      },
      'facebook': function(cb){
        query.find({
          success: function(results) {
            results.forEach(function(item){
              graph.get(item.attributes.eid, function(err, res) {
                console.log({
                  type: 'facebook',
                  eid: res.id,
                  title: res.name,
                  description: res.description,
                  start: res.start_time,
                  end: res.end_time,
                  owner: res.owner.name,
                  location: res.location,
                  day: res.is_date_only,
                  link: 'https://www.facebook.com/events/' + res.id + '/'
                });
              });
            });
          },
          error: function(error) {
            console.log(error);
            cb(null, []);
          }
        });
      }
  }, function (err, results) {
    var events = {};
    results['google'].forEach(function(list){
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
    liveDB.child('event').set(events, cb);
  });
};

var limit = 100;
var running = false;
var run = function() {
    if (running !== false) {
        return ;
    }

    limit -= 1;
    if ( limit < 1 ) {
      process.exit(0);
    }

    running = true;

    console.log(new time.Date().setTimezone('Asia/Taipei').toLocaleTimeString(), 'start');
    parser(function () {
        console.log(new time.Date().setTimezone('Asia/Taipei').toLocaleTimeString(), 'end');
        running = false;
    });
}

console.log(new time.Date().setTimezone('Asia/Taipei').toLocaleTimeString(), 'Calendar Init!');

parser();

setInterval(run, 20 * 60 * 1000);