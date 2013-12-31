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
      $('.registrationCancel').attr('href', '/'+loopStr);
      $('#registrationForm').attr('autocomplete', 'off');
    }
    $scope.register = function() {
      if(this.participant){
        $('#registerButton').attr('disabled', 'disabled');
        console.log('Registering: '+$scope.participant.name);
        $http.post('register', $scope.participant).success(function(data) {
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
    $scope.setup={};
    $scope.setup.participantCounterStart=1;
    $scope.questionsPreviewLabel='Preview Questions:';
    $scope.setup.driveSpreadsheetUrl=
      'https://spreadsheets.google.com/feeds/cells/0AonL0RA7C8fwdHhFNVpyQTFnTkw5VXNxS3Z2X1hFamc/od6/public/basic?alt=json-in-script&callback=JSON_CALLBACK';
    $scope.enableRegistration = function() {
      $http.post('enableRegistration', $scope.setup.enableRegistration).
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
      });
    };
    $scope.resetParticipantCounter = function() {
      $http.post('resetParticipantCounter', {value: $scope.setup.participantCounterStart}).
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
      });
    };
    $scope.dropParticipantsFromDB = function() {
      $('#dropParticipantsFromDbButton').attr('disabled', 'disabled');
      $http.post('dropParticipantsFromDB').
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
          $('#dropParticipantsFromDbButton').removeAttr("disabled");
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
        $('#dropParticipantsFromDbButton').removeAttr('disabled');
      });
    };
    $scope.loadQuestionsFromDrive = function() {
      $('#loadQuestionsButton').attr('disabled', 'disabled');
      $http.jsonp($scope.setup.driveSpreadsheetUrl).
        success(function(data, status) {
          $('#questionsPreview').show();
          $scope.questions = parseNoWorkshopQuestions(data);
          $('#loadQuestionsButton').removeAttr("disabled");
        }).
        error(function(error, status) {
          $scope.error = error || "Request failed";
          $scope.status = status;
          $('#loadQuestionsButton').removeAttr("disabled");
        });
    };
    $scope.prettyPrintQuestions = function() {
      return JSON.stringify($scope.questions, undefined, ' ');
    };
    $scope.saveQuestionsToDB = function() {
      $('#saveQuestionsToDbButton').attr('disabled', 'disabled');
      $http.post('saveQuestionsToDb', $scope.questions).
      success(function(data) {
        if(data.success){
          $scope.questionsPreviewLabel = data.success;
          $('#questionsPreviewLabel').effect('pulsate', 700);
          $('#saveQuestionsToDbButton').removeAttr("disabled");
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
        $('#saveQuestionsToDbButton').removeAttr('disabled');
      });
    };
    $scope.dropQuestionsFromDB = function() {
      $('#dropQuestionsFromDbButton').attr('disabled', 'disabled');
      $http.post('dropQuestionsFromDb').
      success(function(data) {
        if(data.success){
          $scope.status = data.success;
          $('#status').effect('pulsate', 700);
          $('#dropQuestionsFromDbButton').removeAttr("disabled");
        }
      }).
      error(function(error, status) {
        $scope.error = error || "Request failed";
        $scope.status = status;
        $('#dropQuestionsFromDbButton').removeAttr('disabled');
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
