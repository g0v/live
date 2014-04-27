var http = require('http'),
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

console.log(database);

var db_firebase = new Firebase(database.host);
db_firebase.auth(database.token, function(error, result) {
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
                    var vid = /videos\/([\w]+)/.exec(body.feed.entry[i].content.src)[1];
                    active.push({
                        type: 'youtube',
                        title: body.feed.entry[i].title.$t,
                        vid: vid,
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
    }
}

var parser = function (cb){
    now = new time.Date().setTimezone('Asia/Taipei');

    MongoClient.connect(database.channel, function(err, db) {

      var collection = db.collection('channel')

      collection.find({}).toArray(function(err, docs) {
        if (err) {
          return console.error(err)
        }

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
                async.map(docs, function(item, cb){
                    if ( fetch[item.type] ) {
                        fetch[item.type](item.id, cb);
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
                    live[name]['logo'] = docs[index]['logo'];
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
            exec('echo ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() + ' ' + count + ' >> ~/parser.log');
            db_firebase.child('live').set(live, cb);
        });
      });
    });
}

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

setInterval(run, 5 * 60 * 1000);
