'use strict';

/* Directives */


angular.module('cruncher.directives', []).
//  directive('appTitle', ['title', function(title) {
//    return function(scope, elm, attrs) {
//      elm.text(title);
//    };
//  }])
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
