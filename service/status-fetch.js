var SERVICE_ACCOUNT_EMAIL = '440385403729-p33er16c5f0pmkampg8ghtn3mmjj52am@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_PEM_FILE = '8ea6f98f297164910af0501cecfcfa9bb5b5cb92-privatekey.pem';
var FIREBASE_ROOT_URL = 'https://g0v-live-test.firebaseio.com';
var FIREBASE_AUTH_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InByb2plY3QiOiJnMHYtbGl2ZSJ9LCJpYXQiOjEzOTkxNzA3MDV9.b-BAh6ZyVQGbRtI8DmVoxqkIUeM1MzLzSvk8WwGJta8';

var googleapis = require('googleapis');
var easyTable = require('easy-table');
var md5 = require('MD5');
var moment = require('moment');
var Firebase = require('firebase');

var jwt = new googleapis.auth.JWT(
  SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PEM_FILE, null,
  ['https://www.googleapis.com/auth/analytics.readonly']
);

var throw_if = function(err) {
  if (err) {
    console.log('[Exception]', err);
    throw err;
  }
};

googleapis.discover('analytics', 'v3').execute(function(err, client) {
  throw_if(err);

  jwt.authorize(function(err, tokens) {
    throw_if(err);

    client.analytics.data.ga.get({
      'ids': 'ga:85036158',
      'start-date': '2014-04-01',
      'end-date': 'today',
      'metrics': 'ga:totalEvents,ga:uniqueEvents',
      'dimensions': 'ga:eventLabel,ga:eventAction',
//    'sort': 'ga:eventAction',
      'filters': 'ga:eventCategory==VideoStatus',
      'max-results': 25,
    }).withAuthClient(jwt).execute(function(err, result) {
      throw_if(err);
      console.log(result);

      var fetched_at = moment().utc().format('YYYYMMDD\\THHmmss\\Z');
      console.log(fetched_at);

      var table = [];
      for (var i = 0; i < result.rows.length; ++i) {
        var entry = {};
        for (var j = 0; j < result.columnHeaders.length; ++j) {
          entry[{
            'ga:eventLabel':   'url',
            'ga:eventAction':  'status',
            'ga:totalEvents':  'total',
            'ga:uniqueEvents': 'unique',
          }[result.columnHeaders[j].name]] = result.rows[i][j];
        }
        table.push(entry);
      }
      console.log(easyTable.printArray(table));

//    return;
      var rootRef = new Firebase(FIREBASE_ROOT_URL);
      rootRef.auth(FIREBASE_AUTH_TOKEN, function(err) {
        throw_if(err);
        console.log('Logged into Firebase!');

        var videosRef = rootRef.child('live').child('videos');

        // For debugging
        videosRef.on('child_added', function(snapshot) {
          console.log(snapshot.val());
        });
        videosRef.on('child_changed', function(snapshot) {
          console.log(snapshot.val());
        });

        for (var i = 0; i < table.length; ++i) {
          var entry = table[i];

          var videoRef = videosRef.child('video_' + md5(entry.url));
          // XXX: There will be repeated writes on started_at, title, and url fields.
          // TODO: resolve title and started_at
          videoRef.child('started_at').set('20140501T191100Z');
          videoRef.child('title').set('title_' + md5(entry.url));
          videoRef.child('url').set(entry.url);
          videoRef.child('fetched_status').child(fetched_at)
                  .child(entry.status.replace(/^report-/, '')).set(entry.total);
        }
      });
    })
  });
});

