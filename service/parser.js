var http = require('http'),
    async = require('async');

var channel = {
  youtube: [
    'yuting1987'
  ],
  ustream: [

  ]
}

async.map(channel.youtube, function(cid, cb) {
    http.get('http://gdata.youtube.com/feeds/api/users/' + cid + '/live/events?v=2&status=active&alt=json', function(res) {
      var body = '';
      var live = [];
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        body = JSON.parse(body);
        if (body.feed) {
            for (var i = 0, len = body.feed.entry.length; i < len; i++) {
                live.push({
                    title: body.feed.entry[i].title.$t,
                    vid: /videos\/([\w]+)/.exec(body.feed.entry[i].content.src)[1]
                })
            };
        }

        cb(null, live);
      });
    }).on('error', function(e) {
        cb(null, []);
    });
}, function(err, results){
    console.log(results);
});