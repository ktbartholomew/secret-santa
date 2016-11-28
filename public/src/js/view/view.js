var angular = require('angular');

var moduleName = 'view';
module.exports = moduleName;

angular.module(moduleName, [
  require('./view-ctrl.js'),
]);
