var https = require('https'),
    fs = require('fs'),
    querystring = require('querystring');

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var database = JSON.parse(fs.readFileSync('./database.json', 'utf8').replace(/\/\/[ \S]*/gi,''));

var get_token = querystring.stringify({
  'grant_type': 'refresh_token',
  'client_id': database.push.client_id,
  'client_secret': database.push.client_secret,
  'refresh_token': database.push.refresh_token
});

var message = JSON.stringify({
  'channelId': '05561045968221820805/gadhklbfdcmjhdbcegcoaccaimmoodkm',
  'subchannelId': '0',
  'payload': 'Thanks for installing my app!'
});

var req = https.request({
  hostname: 'accounts.google.com',
  path: '/o/oauth2/token',
  method: 'POST',
  headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': get_token.length
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
      console.log('Get Token:', body.access_token);
      var send = https.request({
        hostname: 'www.googleapis.com',
        path: '/gcm_for_chrome/v1/messages',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': message.length,
            'Authorization': 'Bearer ' + body.access_token
        }
      }, function(res){
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          console.log('Send Completed!');
          console.log(body);
        });
      });
      send.on('error', function(e) {
        console.log('problem with send: ' + e.message);
      });

      send.write(message);
      send.end();
    }else{
      console.log('Get Token Failed!');
    }
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

req.write(get_token);
req.end();