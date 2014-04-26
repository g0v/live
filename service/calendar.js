var googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client;

var API_KEY = 'AIzaSyBzQOyq8uKZKMTRfEPP-Qbrmy98CopcZRY';

var printResult = function(err, result) {
  if (err) {
    console.log('Error occurred: ', err);
  } else {
    console.log('Result: ', result);
  }
};


googleapis
  .discover('calendar', 'v1')
  .execute(function(err, client) {
    console.log(client);
});