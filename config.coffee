exports.config =
  conventions:
    assets: /^app\/assets\//
  modules:
    definition: false
    wrapper: false
  paths:
    public: '_public'
  files:
    javascripts:
      joinTo:
        'vendor.js': /^(bower_components|vendor)/
        'app.js': /^app/
      order:
        before: [
          'bower_components/jquery/jquery.js'
        ]
    stylesheets:
      joinTo:
        'vendor.css': (path) ->
          /^(bower_components|vendor)/.test(path) and not /social-likes_(classic|flat).css$/.test(path)
        'app.css': /^app\/styles/
  server:
    port: 3334

