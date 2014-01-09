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

angular.module('cruncher.controllers', ['ngCookies', 'ngResource'])

  .controller('registrationCtrl', function($scope, $http, $resource, $cookieStore, $location, $routeParams) {
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    $scope.application = application;
    $scope.loop = false;
    var loopStr = '?registryLoop=true';
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    if(window.location.search === loopStr){
      $scope.loop = 'true';
      $('.registration').attr('action', '/').attr('href', '/registration'+loopStr).attr('method', 'get');
      $('.registrationCancel').attr('href', '/'+loopStr);
      $('#registrationForm').attr('autocomplete', 'off');
    }
    $scope.register = function() {
      if(this.participant){
        $('#registerButton').attr('disabled', 'disabled');
//        console.log('Registering: '+$scope.participant.name);
        $http.post('register', $scope.participant).success(function(data) {
          if(data.success){
            $('#registrationForm').hide();
            $('#registrationConfirmation').show();
//            console.log(data.success + ' Participant #:' + data.participant.number);
            $scope.participant = data.participant;
            $cookieStore.put('participant', $scope.participant);
            $('.message-reminder').effect('pulsate', 700);
            $('#registerButton').removeAttr("disabled");
          }
        }).
        error(function(data, status) {
          $scope.data = data || "Request failed";
          $scope.status = status;
          $('#registerButton').removeAttr('disabled');
        });
      }
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

  .controller('cruncherCtrl', function($scope, $http) {
    $scope.application = application;
//    $scope.participant = $cookieStore.get('participant');
//    console.log($scope.participant);
  })

// Participant controller functions
  .controller('partnersCtrl', function($scope, $http) {
    $http.get('data/partners.json').success(function(data) {
      $scope.partners = data;
    });
  })

  .controller('questionCtrl', function($scope, $resource, $cookieStore) {
    initializeResizableContainers();
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var questionResource = $resource('/questions' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var participantResource = $resource('/participants' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var answerYes = $('#answerYes');
    var answerMaybe = $('#answerMaybe');
    var answerNo = $('#answerNo');
    var wrapAround = $('#wrapAround');
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    $scope.listQuestions = function() {
      questionResource.query(function(data) {
        $scope.questions = data;
      }, errorMessage);
    };
    $scope.listQuestions(); // Initialize our list of questions.
    function findParticipant(p){
      for(var i=0; i<$scope.participants.length; i++){
        if($scope.participants[i].number == p.number){
          return $scope.participants[i];
        }
      }
      errorMessage('Error: Oops! We seem to have lost your registration information.');
      return null;
    };
    $scope.listParticipants = function() {
      participantResource.query(function(data) {
        $scope.participants = data;
        $scope.participant = findParticipant($cookieStore.get('participant'));
      }, errorMessage);
    };
    $scope.listParticipants(); // Initialize our list of participants.
    $scope.showSwitchPartner = function() {
      if(!$scope.configuration){
        errorMessage('Error: Global application configuration object was not loaded.');
        return;
      }
      if(!$scope.configuration.event){
        errorMessage('Error: Event configuration object was not loaded.');
        return
      }
      // Refresh our list of participants.
      $scope.listParticipants();
      // Clear the current partner information
      $scope.participant.partner = null;
      $('#question').hide();
      $('#partner').show();
    };
    $scope.showSwitchQuestionSet = function() {
      if(!$scope.configuration.event.questionSetSize){
        errorMessage('Error: Event configuration object did not load qestion set size.');
        return
      }
      if(!$scope.questions){
        errorMessage('Error: Did not load question data.');
        return
      }
      $scope.questionsSetTotal = Math.ceil($scope.questions.length / $scope.configuration.event.questionSetSize);
      $('#partner').hide();
      $('#question').hide();
      $('#questionSet').show();
    };
    function getPartner(num){
//      var partnerCopy = null;
      if($scope.participant.partners){ // First search this participant's existing list of partners and return anything we find
        for(var i=0; i<$scope.participant.partners.length; i++){
          if($scope.participant.partners[i].number == num){
            $scope.participant.partners[i].appendMatches = true;
            return $scope.participant.partners[i];
/*
            return {
              number: $scope.participant.partners[i].number,
              name: $scope.participant.partners[i].name,
              nameMatchesOk: $scope.participant.partners[i].nameMatchesOk,
              email: $scope.participant.partners[i].email,
              emailMatchesOk: $scope.participant.partners[i].emailMatchesOk
            }
*/
          }
        }
      } // If we don't find an existing partner they've been with, we fall through to here and search the full list
      for(var i=0; i<$scope.participants.length; i++){
        if($scope.participants[i].number == num){
          return {
            number: $scope.participants[i].number,
            name: $scope.participants[i].name,
            nameMatchesOk: $scope.participants[i].nameMatchesOk,
            email: $scope.participants[i].email,
            emailMatchesOk: $scope.participants[i].emailMatchesOk
          };
        }
      }
      return null;
    };
    $scope.switchPartner = function() {
      if(!$scope.participant.partner || !$scope.participant.partner.number){
        $('#partnerNumber').effect('pulsate', 700);
      } else {
        var num = $scope.participant.partner.number;
        if(num == $scope.participant.number){
          errorMessage("That's YOUR number sillyhead!\n\nEnter your PARTNER'S number below!\n\n");
          return;
        }
        $scope.participant.partner = getPartner(num);
        if(!$scope.participant.partner){
          $scope.listParticipants();
          errorMessage("Participant #"+num+" has not been registered.\n\nVerify this with your workshop coordinator and try again.\n\n");
          return;
        }
        clearErrorMessage();
        $scope.showSwitchQuestionSet();
        if(!$scope.participant.partners){
          $scope.participant.partners = [];
        }
        if(!$scope.participant.partner.appendMatches){
          $scope.participant.partners.push($scope.participant.partner);
        }
      }
    };
    function switchQuestionNumber(number){
      $('#questionNote').hide();
      $scope.question = $scope.questions[number];
        if($scope.question.note && $scope.configuration.event.participant.showNotes){
          setTimeout(function() {$('#questionNote').show('blind', 700)}, 500);
        }
    };
    $scope.switchQuestionSet = function() {
      if($scope.questionSet && $scope.questionSet.number && $scope.questionSet.number <= $scope.questionsSetTotal){
        switchQuestionNumber((($scope.questionSet.number-1) * $scope.configuration.event.questionSetSize) + 1);
        $('#questionSet').hide();
        $('#question').show();
      } else {
        $('#questionSetNumber').effect('pulsate', 700);
      }
    };
    $scope.yes = function() {
      $scope.participant.partner.answer = 'Yes!';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerYes.show('fade', 300);
      setTimeout(function() {answerYes.effect('puff', 1000);}, 2000);
    };
    $scope.maybe = function() {
      $scope.participant.partner.answer = 'Maybe?';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerMaybe.show('fade', 300);
      setTimeout(function() {answerMaybe.effect('puff', 1000);}, 2000);
    };
    $scope.no = function() {
      $scope.participant.partner.answer = 'No.';
      $('#answerButtons').hide(); $('#navigationButtons').show();
      answerNo.show('fade', 300);
      setTimeout(function() {answerNo.effect('puff', 1000);}, 2000);
    };
    $scope.change = function() {
      $scope.participant.partner.answer = null;
      $('#navigationButtons').hide(); $('#answerButtons').show();
    };
    $scope.saveParticipantAnswer = function() {
      if(!$scope.participant.partner.yeses){$scope.participant.partner.yeses = [];}
      if(!$scope.participant.partner.maybes){$scope.participant.partner.maybes = [];}
      if(!$scope.participant.partner.nos){$scope.participant.partner.nos = [];}
      var inYeses = $.inArray($scope.question.number, $scope.participant.partner.yeses);
      var inMaybes = $.inArray($scope.question.number, $scope.participant.partner.maybes);
      var inNos = $.inArray($scope.question.number, $scope.participant.partner.nos);
      if($scope.participant.partner.answer === 'Yes!') {
        if(inYeses<0){                                                              // if not already in the yeses array
          $scope.participant.partner.yeses.push($scope.question.number);            // put it in.
        }
        if(inMaybes>=0){                                                            // if already in the maybes array
          $scope.participant.partner.maybes.splice(inMaybes, 1);                    // take it out.
        }
        if(inNos>=0){                                                               // if already in the nos array
          $scope.participant.partner.nos.splice(inNos, 1);                          // take it out.
        }
      }
      if($scope.participant.partner.answer === 'Maybe?') {
        if(inYeses>=0){                                                             // if already in the yeses array
          $scope.participant.partner.yeses.splice(inYeses, 1);                      // take it out.
        }
        if(inMaybes<0){                                                             // if not already in the maybes array
          $scope.participant.partner.maybes.push($scope.question.number);           // put it in.
        }
        if(inNos>=0){                                                               // if already in the nos array
          $scope.participant.partner.nos.splice(inNos, 1);                          // take it out.
        }
      }
      if($scope.participant.partner.answer === 'No.') {
        if(inYeses>=0){                                                             // if already in the yeses array
          $scope.participant.partner.yeses.splice(inYeses, 1);                      // take it out.
        }
        if(inMaybes>=0){                                                            // if already in the maybes array
          $scope.participant.partner.maybes.splice(inMaybes, 1);                    // take it out.
        }
        if(inNos<0){                                                                // if not already in the nos array
          $scope.participant.partner.nos.push($scope.question.number);              // put it in.
        }
      }
      $scope.participant.partner.questionNumber = $scope.question.number;
      participantResource.update($scope.participant, function(data) {
        // Answer recorded... Switch to next question!
        var nextQuestionNumber = parseInt($scope.question.number) + 1;
        if(nextQuestionNumber >= $scope.questions.length){
          // Wrap around to the beginning
          switchQuestionNumber(1);
          $scope.questionSet.number = 1;
          wrapAround.show('fade', 300);
          setTimeout(function() {wrapAround.effect('puff', 1000);}, 7000);
        } else {
          if(nextQuestionNumber % $scope.configuration.event.questionSetSize == 1){
            // Increment the question set number
            $scope.questionSet.number++;
          }
          switchQuestionNumber(nextQuestionNumber);
        }
        $('#navigationButtons').hide();
        $('#answerButtons').show();
      }, errorMessage);
    };
  })

  .controller('configurationCtrl', function($scope, $http) {
//unused
  })

  
/*
*
* Admin controller functions
*
*/
  .controller('setupCtrl', function($scope, $http, $resource, $routeParams) {
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    $scope.setup={};
    $scope.setup.participantCounterStart=1;
    $scope.questionsPreviewLabel='Preview Questions:';
    $scope.setup.driveSpreadsheetUrl=
      'https://spreadsheets.google.com/feeds/cells/0AonL0RA7C8fwdHhFNVpyQTFnTkw5VXNxS3Z2X1hFamc/od6/public/basic?alt=json-in-script&callback=JSON_CALLBACK';
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    $scope.saveConfiguration = function() {
      //TODO: eventually need to provide a key (event name and date) to save this and look it up.
      configurationResource.update($scope.configuration, function(data){
        $scope.configuration = data;
      }, errorMessage);
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

  .controller('eventDetailsCtrl', function($scope, $resource) {
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    $scope.saveConfiguration = function() {
      //TODO: eventually need to provide a key (event name and date) to save this and look it up.
      configurationResource.update($scope.configuration, function(data){
        $scope.configuration = data;
        
        // ...for now til we build a better messaging system
        errorMessage('Event configuration saved!');
        $('#status').effect('pulsate', 700);
        
      }, errorMessage);
    };
  })

  .controller('participantsCtrl', function($scope, $resource) {
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var participantResource = $resource('/participants' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var questionResource = $resource('/questions' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var participantReport = $('#participantReport');
    var reportContainer = $('#reportContainer');
    $scope.participants = [];
    $scope.participant = {};
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
      $scope.$apply();
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    $scope.listParticipants = function() {
      participantResource.query(function(data) {
        $scope.participants = data;
      }, errorMessage);
    };
    $scope.listParticipants();
    $scope.listQuestions = function() {               // refactor this and use a nested controller patern so we don;t have to redefine these resources over and over again
      questionResource.query(function(data) {
        $scope.questions = data;
      }, errorMessage);
    };
    $scope.listQuestions();
    $scope.editParticipant = function(participant) {
      errorMessage("Edit participant not yet implemented!" + participant.number);
    };
    $scope.editResponses = function(participant) {
      errorMessage("Edit responses not yet implemented!" + participant.number);
      
      
      
    };
    $scope.generateReport = function(participant){
      errorMessage("Generating report for: "+participant.name);
      $('#status').effect('pulsate', 1000);
      setTimeout(clearErrorMessage, 5000);
      $scope.report = generateMatchReport(participant, $scope.participants, $scope.configuration);

      console.log('The "No" Workshop Match Report');
      var matchedClause = ' matched the following questions you responded to:';
      
      for(var i=0; i<$scope.report.length; i++){
        var name = '', email = '', contact = '';
        if($scope.report[i].partner.nameMatchesOk){          //Be sure to check $scope.report[i].partner.nameMatchesOk and $scope.report[i].partner.emailMatchesOk on $scope.report rendering before displaying the name and email respectively
          name = $scope.report[i].partner.name;
        }
        if($scope.report[i].partner.emailMatchesOk){
          email = $scope.report[i].partner.email;
        }
        if(!name && !email){
          contact = 'Participant #'+$scope.report[i].partner.number+' chose not to share any contact information at the beginning of the workshop.\nThey did match the following questions you responded to however:';
        } else if(name){
          contact = name;
          if(email){
            contact += ' ('+email+')';
          }
          contact += matchedClause;
        } else {
          contact = email + matchedClause;
        }
        console.log(contact);
        if($scope.report[i].matches.yeses.length){
          console.log('They said "Yes!" to you in response to the following questions:');
        }
        for(var j=0; j<$scope.report[i].matches.yeses.length; j++){
          var question = $scope.report[i].matches.yeses[j] + ')  ';
          question += $scope.questions[$scope.report[i].matches.yeses[j]].text;
          console.log('\t'+question);
          // You said Yes! / Maybe? to them.
        }
        if($scope.report[i].matches.maybes.length){
          console.log('They said "Maybe?" to you in response to the following questions:');
        }
        for(var j=0; j<$scope.report[i].matches.maybes.length; j++){
          var question = $scope.report[i].matches.maybes[j] + ')  ';
          question += $scope.questions[$scope.report[i].matches.maybes[j]].text;
          console.log('\t'+question);
          // You said Yes! / Maybe? to them.
        }
        console.log('\n');
      }

      participantReport.show();
    };
    $scope.cancelReport = function(participant) {
      participantReport.hide();
    };
    $scope.emailReport = function(participant) {
      var reportHtml = reportContainer.html();
      var mailto = 'mailto:'
//      mailto += participant.email;
mailto += 'jisnut@gmail.com';
      mailto += '?subject=Your Personal "No" Workshop Match Report';
      mailto += '&body='+encodeURIComponent(reportHtml);
      $('#emailReportButton').attr('href', mailto);
      return true;
    };
  })

  .controller('questionsCtrl', function($scope, $resource) {
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var questionResource = $resource('/questions' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    $scope.listQuestions = function() {
      questionResource.query(function(data) {
        $scope.questions = data;
      }, errorMessage);
    };
    $scope.listQuestions();
    $scope.generateQuestionSheets = function(){
      errorMessage("Generating question sheets...");
      $('#status').effect('pulsate', 1000);
      setTimeout(clearErrorMessage, 5000);

      //I don't think this is used!

    }
  })

  .controller('questionSheetCtrl', function($scope, $resource) {
    var configurationResource = $resource('/configuration' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    var questionResource = $resource('/questions' + '/:id', {id: '@_id'}, {'update': {method: 'PUT' }});
    function errorMessage(err) {
      $scope.message = err;
    };
    function clearErrorMessage() {
      $scope.message = '';
    };
    $scope.getConfiguration = function() {
      configurationResource.query(function(data){
        $scope.configuration = data[0];
      }, errorMessage);
    };
    $scope.getConfiguration(); // Initialize our configuration object.
    $scope.listQuestions = function() {
      questionResource.query(function(data) {
        $scope.questions = data;
        $scope.divideQuestions();
      }, errorMessage);
    };
    $scope.listQuestions();
    $scope.divideQuestions = function() {
      $scope.questionSets = [];
      var questionSetIndex = 0;
      for(var i=1; i<$scope.questions.length; i++){
        if(!$scope.questionSets[questionSetIndex]){
          $scope.questionSets[questionSetIndex] = [];
        }
        $scope.questionSets[questionSetIndex].push($scope.questions[i]);
        if(i % $scope.configuration.event.questionSetSize == 0){
          questionSetIndex++;
        }
      }
    };
  })

  .controller('reportsCtrl', function($scope, $http) {

  })

  .controller('statsCtrl', function($scope, $resource) {
    var statsResource = $resource('/stats', {id: '@_id'});
    $scope.updateStats = false;
    function errorMessage(err) {
      $scope.message = err;
    };
    $scope.getResponses = function() {
      statsResource.query(function(data) {
        if($scope.updateStats){
          $scope.play = data[0];
          setTimeout($scope.getResponses, 5000);
        }
      }, errorMessage);
    };

    $scope.toggleAutoUpdateStats = function() {
      if($scope.updateStats){
        $scope.updateStats = false;
        $('#updateStatsButton').text('Play');
      } else {
        $scope.updateStats = true;
        $('#updateStatsButton').text('Stop');
        $scope.getResponses();
      }
    }
  })

  .controller('linksCtrl', function($scope, $http) {

  });
