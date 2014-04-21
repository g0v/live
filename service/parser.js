var http = require('http'),
    async = require('async'),
    fs = require('fs');
var Firebase = require('firebase');

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var database = JSON.parse(fs.readFileSync('./database.json', 'utf8').replace(/\/\/[ \S]*/gi,''));

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

var live;
var channel = database.channel;

var running = false;
fetch = function() {
    if (running !== false) {
        return ;
    }
    running = true;
    async.parallel({
        'database': function(cb){
            db = db_firebase.child('live').val();
            for (key in db)
            {
                db[key].status = 'offlive';
            }
            cb(null, db || {});
        },
        'youtube': function(cb){
            async.map(channel.youtube, function(cid, cb) {
                http.get('http://gdata.youtube.com/feeds/api/users/' + cid + '/live/events?v=2&status=active&alt=json', function(res) {
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
            }, function(err, results){
                var item = [];
                results.forEach(function(id){
                    id.forEach(function(active){
                        item.push(active);
                    });
                });
                cb(null, item);
            });
        },
        'ustream': function(cb){
            async.map(channel.ustream, function(cid, cb) {
                http.get('http://api.ustream.tv/json?subject=channel&uid=' + cid + '&command=getInfo', function(res) {
                  var body = '';
                  var live = [];
                  res.on('data', function(chunk) {
                    body += chunk;
                  });
                  res.on('end', function() {
                    body = JSON.parse(body);
                    if (body.results.status == 'live') {
                        live.push({
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
            }, function(err, results){
                var item = [];
                results.forEach(function(id){
                    id.forEach(function(active){
                        item.push(active);
                    });
                });
                cb(null, item);
            });
        }
    }, function (err, results) {
        var count = 0;
        var now = Math.floor(Date.now() / 1000);
        live = results['database'] || {};
        results['youtube'].forEach(function(active){
            active.type = 'youtube';
            active.status = 'live';
            active.updated_at = now;
            live['y'+active.vid] = active;
            count += 1;
        });
        results['ustream'].forEach(function(active){
            active.type = 'ustream'
            active.updated_at = now;
            active.status = 'live';
            live['u'+active.vid] = active;
            count += 1;
        });
        for (key in live)
        {
            if ( (live[key].updated_at + 15 * 60) < now ) {
                delete live[key];
            }
        }
        console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' ' + count);
        db_firebase.child('live').set(live);
        running = false;
    });
}

setInterval(fetch, 5 * 60 * 1000);
