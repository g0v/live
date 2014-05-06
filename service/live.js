var http = require('http'),
    async = require('async'),
    fs = require('fs'),
    exec = require('child_process');

var time = require('time');

var Parse = require('parse').Parse;
var Firebase = require('firebase');


if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var cfg = require('./database.json');
var now;

Parse.initialize(cfg.live.appid, cfg.live.key, cfg.live.master);
Parse.Cloud.useMasterKey();
var Channel = Parse.Object.extend("channel");

var db_firebase = new Firebase(cfg.release.host);
db_firebase.auth(cfg.release.token, function(error, result) {
  if(error) {
    console.log("Login Failed!", error);
  } else {
    console.log('Authenticated successfully with payload:', result.auth);
    console.log('Auth expires at:', new Date(result.expires * 1000));
  }
});

var fetch = {
    'youtube': function(id, cb) {
        http.get('http://gdata.youtube.com/feeds/api/users/' + id + '/live/events?v=2&status=active&alt=json', function(res) {
          var body = '';
          var active = [];
          res.on('data', function(chunk) {
            body += chunk;
          });
          res.on('end', function() {
            body = JSON.parse(body);
            if (body.feed.entry) {
                for (var i = 0, len = body.feed.entry.length; i < len; i++) {
                    var vid = /videos\/([\w-_]+)/.exec(body.feed.entry[i].content.src)[1];
                    active.push({
                        type: 'youtube',
                        title: body.feed.entry[i].title.$t,
                        vid: vid,
                        user: id,
                        url: 'http://youtu.be/' + vid
                    });
                };
            }

            cb(null, active);
          });
        }).on('error', function(e) {
            cb(null, []);
        });
    },
    'ustream': function(id, cb){
        http.get('http://api.ustream.tv/json?subject=channel&uid=' + id + '&command=getInfo', function(res) {
          var body = '';
          var live = [];
          res.on('data', function(chunk) {
            body += chunk;
          });
          res.on('end', function() {
            body = JSON.parse(body);
            if (body.results.status == 'live') {
                live.push({
                    type: 'ustream',
                    title: body.results.title,
                    vid: body.results.id,
                    url: 'http://www.ustream.tv/channel/' + body.results.id
                });
            }

            cb(null, live);
          });
        }).on('error', function(e) {
            cb(null, []);
        });
    },
    'ustream_user': function(id, cb){
        http.get('http://api.ustream.tv/json?subject=user&uid=' + id + '&command=listAllChannels', function(res) {
          var body = '';
          var live = [];
          res.on('data', function(chunk) {
            body += chunk;
          });
          res.on('end', function() {
            body = JSON.parse(body);
            body.results.forEach(function(channel){
                if (channel.status == 'live') {
                    live.push({
                        type: 'ustream',
                        title: channel.title,
                        vid: channel.id,
                        user: id,
                        url: 'http://www.ustream.tv/channel/' + channel.id,
                        thumb: channel.imageUrl.small
                    });
                }
            });

            cb(null, live);
          });
        }).on('error', function(e) {
            cb(null, []);
        });
    }
}


var query = new Parse.Query(Channel);
var parser = function (cb){
    now = new time.Date().setTimezone('Asia/Taipei');

    query.find({
        success: function(channel) {
            async.parallel({
                'database': function(cb){
                    db_firebase.child('live').once('value', function(live) {
                        var db = live.val();
                        for (key in db)
                        {
                            db[key].status = 'offlive';
                        }
                        cb(null, db || {});
                    })
                },
                'live': function(cb){
                    async.map(channel, function(item, cb){
                        if ( fetch[item.type] ) {
                            fetch[item.type](item.uid, cb);
                        }else{
                            cb(null, []);
                        }
                    }, function (err, results) {
                        cb(null, results);
                    });
                }
            }, function (err, results) {
                var count = 0;
                var updated_at = Math.floor(Date.now() / 1000);
                var live = results['database'] || {};
                var new_live = [];

                results['live'].forEach(function(source, index){
                    source.forEach(function(active){
                        var name = (active.type=='youtube' ? 'y' : 'u')+active.vid;
                        if ( !live[name] ) {
                            live[name] = {};
                            new_live.push(active);
                        }
                        for (key in active) {
                            live[name][key] = active[key];
                        }
                        live[name]['logo'] = active.thumb || docs[index]['logo'];
                        live[name]['status'] = 'live';
                        live[name].updated_at = updated_at;
                        count += 1;
                    });
                });
                for (key in live)
                {
                    if ( (live[key].updated_at + 15 * 60) < updated_at ) {
                        delete live[key];
                    }
                }
                db_firebase.child('live').set(live, cb);
            });
        },
        error: function(error) {
            console.log("Fetch Channel Error: " + error.code + " " + error.message);
        }
    });
}

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

console.log(new time.Date().setTimezone('Asia/Taipei').toLocaleTimeString(), 'Live Init!');

parser();

setInterval(run, 5 * 60 * 1000);
