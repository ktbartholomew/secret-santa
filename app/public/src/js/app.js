window.$ = window.jQuery = require('jquery');
var angular = require('angular');

angular.module('app', [
  require('angular-ui-router'),
  require('angular-cookies'),
  require('./routers'),
  require('./services/facebook'),
  require('./home/home'),
  require('./login/login'),
  require('./view/view')
])
.config(['$facebookProvider', function ($facebookProvider) {
  $facebookProvider.config({
    appId: '828871660564576'
  });
}]);

FB.init({
  appId: '828871660564576',
  cookie: true,
  version: 'v2.5'
});

angular.bootstrap(document, ['app']);
