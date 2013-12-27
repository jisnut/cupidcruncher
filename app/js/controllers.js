'use strict';
var application = {
 version: '0.2',
 title: 'Cupid Cruncher',
 event: 'The "No" Workshop',
 description: 'Application description',
 about: 'Application about',
 author: 'Justin Cleveland',
 email: 'justin.j.cleveland@gmail.com'
};

/* Controllers */

angular.module('cruncher.controllers', [])

  .controller('registrationCtrl', function($scope) {
    $scope.application = application;
  })

  .controller('loginCtrl', function($scope) {
    $scope.application = application;
    $scope.adminLogin = function() {
      console.log("Logging in admin: "); // ...admin user name
      // maybe some validation?
    }
  })

  .controller('adminCtrl', function($scope) {
    $scope.application = application;
  })

  .controller('cruncherCtrl', function($scope) {
    $scope.application = application;

  })

// Participant controller functions
  .controller('partnersCtrl', function($scope, $http) {
    $http.get('data/partners.json').success(function(data) {
      $scope.partners = data;
    });
  })

  .controller('questionsCtrl', function($scope, $http) {
    $http.get('data/questions.json').success(function(data) {
      $scope.questions = data;
    });
  })

  .controller('configurationCtrl', function($scope, $http) {
    $http.get('data/configuration.json').success(function(data) {
      $scope.configuration = data;
    });
  })

// Admin controller functions
  .controller('setupCtrl', function($scope, $routeParams) {
      this.name = "BookCntl";
      this.params = $routeParams;
  })

  .controller('eventDetailsCtrl', function($scope, $http) {
    console.log('firing eventDetailsCtrl');
//    console.log('$scope: '+$scope);
  })

  .controller('participantsCtrl', function($scope, $http) {

  })

  .controller('questionsCtrl', function($scope, $http) {

  })

  .controller('reportsCtrl', function($scope, $http) {

  })

  .controller('reportsCtrl', function($scope, $http) {

  })

  .controller('reportsCtrl', function($scope, $http) {

  });
