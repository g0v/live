var https = require('https'),
    fs = require('fs'),
    querystring = require('querystring');

var Parse = require('parse').Parse;
var Token = Parse.Object.extend("token");

var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var cfg = JSON.parse(fs.readFileSync('./database.json', 'utf8').replace(/\/\/[ \S]*/gi,''));

Parse.initialize(cfg.chrome.appid, cfg.chrome.key, cfg.chrome.master);
Parse.Cloud.useMasterKey();

var tokens = {};
var query = new Parse.Query(Token);
query.find({
  success: function(results) {
    tokens = {};
    results.forEach(function(item){
      if ( /[0-9]+\/[\w]+/i.exec(item.attributes.token) ) {
        var timestamp = new Date(item.createdAt).getTime();
        if ((tokens[item.attributes.token] || 0) < timestamp) {
          tokens[item.attributes.token] = timestamp;  
        }
      }
    });
    MongoClient.connect(cfg.chrome.mongo, function(err, db) {
        if (err) console.log(err);
        var count = 0;
        var collection = db.collection('chrome_token');
        for ( token in tokens ) {
          collection.update({
            "token": token
          }, {
            "token": token,
            "updatedAt": tokens[token]
          }, {
            upsert: true
          }, function(err) {
            if (err) {
              console.log('update token error', err);
            }
          });
          count += 1;
        }
        console.log('update completed!', count);
    });
  },
  error: function(error) {
    console.log(error);
  }
});