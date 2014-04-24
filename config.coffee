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
        'vendor.js': /^bower_components/
        'app.js': /^app\/scripts/
      order:
        before: [
          'bower_components/jquery/jquery.js'
        ]
    stylesheets:
      joinTo:
        'app.css': /^app\/styles/

