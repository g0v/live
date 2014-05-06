var https = require('https'),
    fs = require('fs'),
    querystring = require('querystring'),
    async = require('async');

var Parse = require('parse').Parse;

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var message = process.argv[2];

var cfg = require('./database.json');

Parse.initialize(cfg.live.appid, cfg.live.key, cfg.live.master);
Parse.Cloud.useMasterKey();
var Chrome_Token = Parse.Object.extend("chrome_token");
var query = new Parse.Query(Chrome_Token);

var sendNotify = function(task, cb) {
  var access = task.access;
  var token = task.token;
  var msg = task.msg;
  var message = JSON.stringify({
    'channelId': token,
    'subchannelId': '0',
    'payload': new Buffer(JSON.stringify({
      'type': 'message',
      'url': 'http://www.google.com/',
      'title': msg
    })).toString('base64')
  });

  var request = https.request({
    hostname: 'www.googleapis.com',
    path: '/gcm_for_chrome/v1/messages',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': message.length,
        'Authorization': 'Bearer ' + access
    }
  }, function(res){
    var body = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      cb && cb(null, task);
    });
  });

  request.on('error', function(e) {
    cb && cb(e, task);
  });

  request.write(message);
  request.end();
}

var getAccess = function(grant, cb){
  var grant = querystring.stringify(grant);

  var req = https.request({
    hostname: 'accounts.google.com',
    path: '/o/oauth2/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': grant.length
    }
  }, function(res){
    var body = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      body = JSON.parse(body);
      if ( body.access_token ) {
        console.log('Get Access Token:', body.access_token);
        cb(null, body.access_token);
      }else{
        cb('Body Access Token is Null');
      }
    });
  });

  req.on('error', function(e) {
    cb(e.message);
  });

  req.write(grant);
  req.end();
}

getAccess({
  'grant_type': 'refresh_token',
  'client_id': cfg.push.client_id,
  'client_secret': cfg.push.client_secret,
  'refresh_token': cfg.push.refresh_token
}, function(err, access){
  if (err) {
    console.log('Get Access Token Error:', err);
  }else{
    var queue = async.queue(function (task, callback) {
      sendNotify(task, callback);
    }, 5);

    query.find({
      success: function(results) {
        var count = results.length;
        // queue.push({'access':access ,'token':'05561045968221820805/fhcffinobmpdchcoapdeoinhdmlihiok', 'msg':'『5/4(日)14:00』和平路過服務處，要求費鴻泰承諾「先立法，再審查」'}, function(err, task){
        //   console.log('completed!', task.token);
        //   process.exit(0);
        // });
        results.forEach(function(item){
          queue.push({'access':access ,'token':item.attributes.token, 'msg':'『5/6』仿聲鳥正在松菸護樹現場表演'}, function (err, task) {
              console.log('completed!', task.token);
              count -= 1;
              if ( count < 1 ) {
                process.exit(0);
              }
          });
        });
      }
    });
  }
});

// // JSON.parse(decodeURIComponent(escape(atob('eyJ0eXBlIjoibGl2ZSIsInVybCI6InVybCIsInRpdGxlIjoi5oiR5oSb5Y+w54GjIn0='))))