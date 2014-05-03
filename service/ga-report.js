var SERVICE_ACCOUNT_EMAIL = '440385403729-p33er16c5f0pmkampg8ghtn3mmjj52am@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_PEM_FILE = '8ea6f98f297164910af0501cecfcfa9bb5b5cb92-privatekey.pem';

var googleapis = require('googleapis');
var easyTable = require('easy-table');

var jwt = new googleapis.auth.JWT(
  SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PEM_FILE, null,
  ['https://www.googleapis.com/auth/analytics.readonly']
);

var throw_if = function(err) {
  if (err) {
    console.log('[Exception]', err);
    throw err;
  }
}

googleapis.discover('analytics', 'v3').execute(function(err, client) {
  throw_if(err);

  jwt.authorize(function(err, tokens) {
    throw_if(err);

    client.analytics.data.ga.get({
      'ids': 'ga:85036158',
      'start-date': '2014-04-01',
      'end-date': 'today',
      'metrics': 'ga:totalEvents,ga:uniqueEvents,ga:sessionsWithEvent,ga:eventsPerSessionWithEvent',
      'dimensions': 'ga:eventAction,ga:country,ga:city',
//    'sort': 'ga:eventAction',
      'filters': 'ga:eventCategory==VideoStatus',
      'max-results': 25,
    }).withAuthClient(jwt).execute(function(err, result) {
      throw_if(err);
//    console.log(result);

      var table = new easyTable();
      for (var i = 0; i < result.rows.length; ++i) {
        for (var j = 0; j < result.columnHeaders.length; ++j) {
          table.cell(result.columnHeaders[j].name, result.rows[i][j]);
        }
        table.newRow();
      }
      console.log(table.toString());
    })
  });
});

