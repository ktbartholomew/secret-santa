var angular = require('angular');

var moduleName = 'home.navbar-ctrl';
module.exports = moduleName;

angular.module(moduleName, [])
.controller('NavBarCtrl', ['$facebook', function ($facebook) {
  this.name = '';

  $facebook.getMe()
  .then(function (me) {
    this.name = me.name;
    this.picture = me.picture.data.url;
  }.bind(this));

}]);
