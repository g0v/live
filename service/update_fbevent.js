var https = require('https'),
    fs = require('fs');

var Parse = require('parse').Parse,
    Token = Parse.Object.extend("token");

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var graph = require('fbgraph');

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var cfg = require('./database.json');

graph.setAccessToken(cfg.fbevent.fbtoken);

graph.get('1489281451285320', function(err, res) {
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