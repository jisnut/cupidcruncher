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

angular.module('cruncher.controllers', ['ngCookies'])

  .controller('registrationCtrl', function($scope, $http, $cookieStore, $location, $routeParams) {
    $scope.application = application;
    $scope.loop = false;
    var loopStr = '?registryLoop=true';
    if(window.location.search === loopStr){
      $scope.loop = 'true';
      $('.registration').attr('action', '/').attr('href', '/registration'+loopStr).attr('method', 'get');
      $('#registrationForm').attr('autocomplete', 'off');
    }
    $scope.register = function() {
      if(this.participant){
        $('#registerButton').attr('disabled', 'disabled');
        console.log('Registering: '+this.participant.name);
        $http.post('register', this.participant).success(function(data) {
          if(data.success){
            $('#registrationForm').hide();
            $('#registrationConfirmation').show();
            console.log(data.success + ' Participant #:' + data.participant.number);
            $scope.participant = data.participant;
            $cookieStore.put('participant', $scope.participant);
            $('.message-reminder').effect('pulsate', 700);
            $('#registerButton').removeAttr("disabled");
          }
        }).
        error(function(data, status) {
// Deal with this...
          $scope.data = data || "Request failed";
          $scope.status = status;
          $('#registerButton').removeAttr('disabled');
        });
      }
//      return false; // prevent the submit action???
    };
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

  .controller('cruncherCtrl', function($scope, $http, $cookieStore) {
    $scope.application = application;
    $scope.participant = $cookieStore.get('participant');
    console.log($scope.participant);

  })

// Participant controller functions
  .controller('partnersCtrl', function($scope, $http) {
    $http.get('data/partners.json').success(function(data) {
      $scope.partners = data;
    });
  })

  .controller('questionCtrl', function($scope, $http) {
    $http.get('data/partners.json').success(function(data) {
//    $http.get('data/questions.json').success(function(data) {
      $scope.questions = data;
    });
  })

  .controller('configurationCtrl', function($scope, $http) {
    $http.get('data/configuration.json').success(function(data) {
      $scope.configuration = data;
    });
  })

// Admin controller functions
  .controller('setupCtrl', function($scope, $http, $routeParams) {
    $scope.questionsPreviewLabel = 'Preview Questions:';
    $scope.driveSpreadsheetUrl = 'https://spreadsheets.google.com/feeds/cells/0AonL0RA7C8fwdHhFNVpyQTFnTkw5VXNxS3Z2X1hFamc/od6/public/basic?alt=json-in-script&callback=JSON_CALLBACK';
    $scope.loadQuestionsFromDrive = function() {
      var driveUrl = $scope.driveSpreadsheetUrl;
      $('#loadQuestionsButton').attr('disabled', 'disabled');
      console.log('Loading questions from Google Drive Spreadsheet: '+driveUrl);
      $http.jsonp(driveUrl).
        success(function(data, status) {
          $('#questionsPreview').show();
          $scope.status = status;
          $scope.questions = parseNoWorkshopQuestions(data);
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
        });
    };
    $scope.saveQuestionsToDB = function() {
      $('#saveQuestionsToDbButton').attr('disabled', 'disabled');
      console.log('Saving Questions to Database...');
      $http.post('saveQuestionsToDb', $scope.questions).success(function(data) {
        if(data.success){
          $scope.questionsPreviewLabel = data.success;
          $('#questionsPreviewLabel').effect('pulsate', 700);
          $('#saveQuestionsToDbButton').removeAttr("disabled");
        }
      }).
      error(function(data, status) {
// Deal with this...
        $scope.data = data || "Request failed";
        $scope.status = status;
        $('#saveQuestionsToDbButton').removeAttr('disabled');
      });
    };
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

  .controller('statsCtrl', function($scope, $http) {

  })

  .controller('linksCtrl', function($scope, $http) {

  });
