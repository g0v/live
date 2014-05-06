var https = require('https'),
    fs = require('fs'),
    async = require('async');

var Parse = require('parse').Parse;

if ( !fs.existsSync('database.json') ) {
    fs.linkSync('database-sample.json', 'database.json');
}

var cfg = require('./database.json');


Parse.initialize(cfg.chrome.appid, cfg.chrome.key, cfg.chrome.master);
Parse.Cloud.useMasterKey();

Token = Parse.Object.extend("token");
Chrome_Token = Parse.Object.extend("chrome_token");

var token = [];
var timestamp = {};
var query = new Parse.Query(Token);
var upset = new Parse.Query(Chrome_Token);
query.find({
  success: function(results) {
    token = [];
    timestamp = {};
    results.forEach(function(item){
      if ( /[0-9]+\/[\w]+/i.exec(item.attributes.token) ) {
        var updateAt = new Date(item.createdAt).getTime();
        if ((timestamp[item.attributes.token] || 0) < updateAt) {
          timestamp[item.attributes.token] = updateAt;  
        }
        if (token.indexOf(item.attributes.token) < 0) {
          token.push(item.attributes.token);
        }
      }
    });
    Parse.initialize(cfg.live.appid, cfg.live.key, cfg.live.master);
    Parse.Cloud.useMasterKey();
    async.each(token, function (item, cb) {
      upset.equalTo("token", item);
      upset.first({
        success: function(chrome_token) {
          if ( chrome_token ) {
            chrome_token.save({
              "responseAt": timestamp[item]
            },{
              success: function(chrome_token) {
                console.log('success update', item);
              },
              error: function(chrome_token, error) {
                console.log('failed update', item);
              }
            });
          }else{
            chrome_token = new Chrome_Token();
            chrome_token.save({
              "token": item,
              "responseAt": timestamp[item]
            },{
              success: function(chrome_token) {
                console.log('success create', item);
              },
              error: function(chrome_token, error) {
                console.log('failed create', item);
              }
            });
          }
        },
        error: function(error) {
          console.log('failed', item);
        }
      });
    });
  },
  error: function(error) {
    console.log(error);
  }
});