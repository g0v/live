(function($) {

$(document).ready(function() {

  // Load Google Analytics dynamically.
  // TODO: Use jsenv instead.
  console.log('[status_bar] GA:TrackingID = ' + APP_CONFIG.GOOGLE_ANALYTICS.TRACKING_ID);
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
  console.log('[status_bar] url=' + url);

  // https://github.com/sapegin/social-likes
  var update_social_likes = function() {
    $('#social-likes').socialLikes({ counters: true, forceUpdate: true, url: url, title: '<title>' });
    console.log('updated social-likes');
    setTimeout(update_social_likes, APP_CONFIG.SOCIAL_REFRESH_TIME);
  };
  update_social_likes();

  $('.report-status').click(function(event) {
    var status = $(this).data('videoStatus');
    if (status) {
      console.log('[status_bar] report video status as "' + status + '" for ' + url);
      ga_push('VideoStatus', 'report-' + status, url);

      console.log('[status_bar] disable all reporting buttons');
      $('.report-status').attr('disabled', 'disabled');
      setTimeout(function() {
        $('.report-status').removeAttr('disabled');
        console.log('[status_bar] enable all reporting buttons');
      }, APP_CONFIG.DISABLE_REPORTING_TIME);
    }
  });
});

})(jQuery);
