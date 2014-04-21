var http = require('http'),
    async = require('async');
var Firebase = require('firebase');

var channel = {
  youtube: [
    'yuting1987',               // 宇庭
    'indietaiwan',              // 大帝音地
    'UC6BgDThjkr6sEOovgcrvXjQ'  // Pei-Che Chang
  ],
  ustream: [
    '17831478',                 // Appendectomy Project 割闌尾計畫
    'art1025',                  // 公投盟
    'nonukestw'                 // 不要核四、五六運動
  ]
}

var twlive = new Firebase('https://twlive.firebaseio.com/');
twlive.auth('oFqJQgFQujCDzQno7a88OsD54tzOEHTIGs9ltlcS', function(error, result) {
  if(error) {
    console.log("Login Failed!", error);
  } else {
    console.log('Authenticated successfully with payload:', result.auth);
    console.log('Auth expires at:', new Date(result.expires * 1000));
  }
});

var live = [];

async.series({
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
                        vid: id,
                        url: 'http://www.ustream.tv/channel/' + id
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
    results['youtube'].forEach(function(active){
        live['y'+active.vid] = active;
    });
    results['ustream'].forEach(function(active){
        live['u'+active.vid] = active;
    });
    console.log(live);
    twlive.child('live').set(live);
});
