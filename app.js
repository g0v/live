var APP_CONFIG = window.APP_CONFIG = {
  "BUILD": "git-unknown",
  "GOOGLE_ANALYTICS": {
    "TRACKING_ID": 'UA-50192245-1'
  }
}

;
;(function($) {

$(document).ready(function() {

  // Load Google Analytics dynamically.
  // TODO: Use jsenv instead.
  console.log('GA:TrackingID = ' + APP_CONFIG.GOOGLE_ANALYTICS.TRACKING_ID);
  ga('create', APP_CONFIG.GOOGLE_ANALYTICS.TRACKING_ID, { 'cookieDomain': 'none' });
  ga('send', 'pageview');

  var ga_push = function(category, action, label, value) {
    // Universal Analytics
    if (typeof window.ga === "function") {
      // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
      var event = {
        "hitType": "event",
        "location": window.location,
        "title": window.document.title
      };

      if (category)       { event["eventCategory"]  = category;       }
      if (action)         { event["eventAction"]    = action;         }
      if (label)          { event["eventLabel"]     = label;          }
      if (value)          { event["eventValue"]     = value;          }

//    console.log(event);
      window.ga("send", event);
    }
  };

  // Get video URL
  var pos = document.location.href.indexOf('?');
  var url = (pos < 0) ? '-' : decodeURIComponent(document.location.href.slice(pos + 1));
//console.log('url=' + url);

  $('.report-status').click(function(event) {
    var status = $(this).data('videoStatus');
    if (status) {
      console.log('report video status as "' + status + '" for ' + url);
      ga_push('VideoStatus', 'report-' + status, url);
    }
  });
});

})(jQuery);

;
//# sourceMappingURL=app.js.map