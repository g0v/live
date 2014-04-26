var gcal = require('google-calendar');
var google_calendar = new gcal.GoogleCalendar('AIzaSyBzQOyq8uKZKMTRfEPP-Qbrmy98CopcZRY');


google_calendar.calendarList.list(function(err, calendarList) {
  console.log(err, calendarList);
});