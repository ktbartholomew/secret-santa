var angular = require('angular');

var moduleName = 'home';
module.exports = moduleName;

angular.module(moduleName, [
  require('./home-ctrl.js'),
  require('./navbar-ctrl.js')
]);
