window.$ = window.jQuery = require('jquery');
var angular = require('angular');

require('checklist-model'); // doesn't export a module name

angular.module('app', [
  require('angular-ui-router'),
  'checklist-model',
  require('./routers'),
  require('./services/facebook'),
  require('./home/home'),
  require('./login/login'),
  require('./new'),
  require('./view/view')
]);

FB.init({
  appId: process.env.FACEBOOK_APP_ID,
  cookie: true,
  version: 'v2.5'
});

angular.bootstrap(document, ['app']);
