var angular = require('angular');

module.exports = 'services.page-title';

angular.module(module.exports, [])
.service('$pageTitle', [
  '$rootScope',
  function ($rootScope) {
    var defaultTitle = document.title;
    var separator = ' - ';
    var titleSegments = [];

    var updateTitle = function () {
      var segments = [];

      titleSegments.forEach(function (segment) {
        segments.push(segment);
      });

      segments.push(defaultTitle);
      document.title = segments.join(separator);
    };

    return {
      set: function (value) {
        value = value || [];

        // cast to single-element array if a string was provided.
        if (typeof value === 'string') {
          value = [value];
        }

        titleSegments = value || [];

        updateTitle();
      }
    };
  }
]);
