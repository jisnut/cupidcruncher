
// Running statistics (NOT saved to the DB)...
var play = {
  participants: {
    total: 0
  },
  responses: {
    total: 0,
    yeses: 0,
    maybes: 0,
    nos: 0
  },
  pairings: [],
  questions: []
};
var configuration = {
  event: {
    name: 'SEX+STL No Workshop',
    registration: {
      enabled: true,
      requireEmail: false
    },
    date: '2014-01-09',
    questionSetSize: 5,
    questionSetDuration: 3,
    maybes: {
      allowed: true,
      matchesYeses: true
    },
    participant: {
      showNotes: true,
      showTimer: false,
      rateQuestions: false
    },
    partner: {
      notesAllowed: false,
      ratingsAllowed: false
    }
  }
}
var mainTitle = 'SEX+STL Cupid Cruncher';
var NODATA = {error: 'ERROR: No data sent in request body.'};
exports.index = function(req, res){
  res.render('index', {title: mainTitle});
};
exports.qr = function(req, res){
  res.render('qr', {title: 'QR Code - '+mainTitle});
};
exports.rules = function(req, res){
  res.render('rules', {title: 'Rules - '+mainTitle});
};
exports.login = function(req, res){
  res.render('login', {title: 'Admin Login - '+mainTitle});
};
exports.admin = function(db) {
  return function(req, res){
    if((req.body.username === 'justin' && req.body.password === 'nibor') ||
      (req.body.username === 'robin' && req.body.password === 'jisnut')){
      res.render('admin', {title: 'Administration - '+mainTitle});
    } else {
      res.render('login', {title: 'LOGIN FAILED: Admin Login - '+mainTitle});
    }
  };
};
exports.registration = function(req, res){
  res.render('registration', {title: 'Registration - '+mainTitle});
};
exports.registrationLoop = function(req, res){
  var registryLoop = '<input type="hidden" id="registryLoop" name="registryLoop" value="false"></input>';
  res.render('registration', {title: 'Registration - '+mainTitle});
};
exports.register = function(db) {
  return function(req, res) {
    if(req.body){
      var participant = req.body;
      var counters = db.get('counters');
      var promise = counters.findAndModify({'query': {_id:'participantNumber'}, 'update': {'$inc': {'seq': 1}}, 'new':true});
      promise.success(function(doc){
        participant.number = doc.seq;
        var collection = db.get('participant');
        collection.insert(participant, function (err, doc) {
          if(err){
            console.error('DB Error: '+err);
            res.json(500, {error: 'There was a problem registering the participant in the database: '+err})
          } else {
            play.participants.total++;
            res.json({success:"Registered!", participant:doc});
          }
        });
      });
      promise.error(function(err){
        res.json(500, {error: 'There was a problem acquiring your participant number: '+err})
      });
    } else {
      res.json(500, NODATA);
    }
  };
};
exports.play = function(db) {
  return function(req, res){
    res.render('play', {title: mainTitle});
  };
};

// Admin setup functions
exports.loadConfiguration = function(db) {
  return function(req, res) {
//    if(req.body){
//      var configPair = req.body;
//      var collection = db.get('configuration');   // Client provides a key string identifying the configuration document to modify
//      var promise = collection.find({_id: configPair.key});
//      promise.success(function(doc){
        res.json([configuration]);
//      });
//      promise.error(function(err){
//        res.json(500, {error: 'There was a problem updating the configuration: '+err})
//      });
//    } else {
//      res.json(500, NODATA);
//    }
  };
};
exports.saveConfiguration = function(db) {
  return function(req, res) {
    if(req.body){
//      var configPair = req.body;
//      var collection = db.get('configuration');   // Client provides a key string identifying the configuration document to modify
//      var promise = collection.findAndModify({'query': {_id: configPair.key}, 'update': configPair.configuration, 'new':true});
//      promise.success(function(doc){
        configuration = req.body;
        res.json(configuration);
//      });
//      promise.error(function(err){
//        res.json(500, {error: 'There was a problem updating the configuration: '+err})
//      });
    } else {
      res.json(500, NODATA);
    }
  };
};
exports.resetParticipantCounter = function(db) {
  return function(req, res) {
    if(req.body){
      var value = req.body.value;
      var counters = db.get('counters');
      var promise = counters.findAndModify({'query': {_id:'participantNumber'}, 'update': {'seq': value}});
      promise.success(function(doc){
        res.json({success:"Participant number counter reset."});
      });
      promise.error(function(err){
        res.json(500, {error: 'There was a problem resetting the participant number counter: '+err})
      });
    } else {
      res.json(500, NODATA);
    }
  };
};
exports.dropParticipantsFromDB = function(db) {
  return function(req, res) {
    var collection = db.get('participant');
    collection.drop(function (err, doc) {
      if(err){
        console.error('DB Error: '+err);
        res.json(500, {error: 'There was a problem dropping the participants collection from the database: '+err});
      } else {
        play.participants.total=0;
        res.json({success:'All participants dropped from database!'});
      }
    });
  };
};
exports.saveQuestionsToDb = function(db) {
  return function(req, res) {
    if(req.body){
      var questions = req.body;
      var collection = db.get('questions');
      collection.insert(questions, function (err, doc) {
        if(err){
          console.error('DB Error: '+err);
          res.json(500, {error: 'There was a problem saving questions in the database: '+err});
        } else {
          res.json({success:'Questions saved to database!'});
        }
      });
    } else {
      res.json(500, NODATA);
    }
  };
};
exports.dropQuestionsFromDb = function(db) {
  return function(req, res) {
    var collection = db.get('questions');
    collection.drop(function (err, doc) {
      if(err){
        console.error('DB Error: '+err);
        res.json(500, {error: 'There was a problem dropping the questions collection from the database: '+err});
      } else {
        res.json({success:'Questions dropped from database!'});
      }
    });
  };
};

exports.configuration = function(db) {
  return function(req, res) {
    var collection = db.get('configuration');
    collection.findOne({_id: configPair.key},{},function(e,docs){
      res.json(docs);
    });
  };
};
exports.participants = function(db) {
  return function(req, res) {
    var collection = db.get('participant');
    collection.find({},{},function(e,docs){
      res.json(docs);
    });
  };
};
exports.questions = function(db) {
  return function(req, res) {
    var collection = db.get('questions');
    collection.find({},{},function(e,docs){
      res.json(docs);
    });
  };
};
exports.partners = function(db) {
  return function(req, res) {
    var collection = db.get('partners');
    collection.find({},{},function(e,docs){
      res.json(docs);
    });
  };
};
exports.participant = function(db) {
  return function(req, res) {
    if(req.body){
      // var participant = req.cookies.participant; // Cool we can do this, but we're passing in the whole participant object now.
      var participant = req.body; // First: Find this participant.
      var collection = db.get('participant');
      collection.updateById(participant._id, participant)
        .success(function(doc){
          var message = doc+" participant(s) were updated";
          console.log(message);
          if(!doc){
            res.json(500, {error: message});
          } else {
// Next: update this participant's partner's answers list with their responses
//                                                                  if(participant.partner.answer === 'Yes!'){
//                                                                    yesList [participant.number]: question number
//                                                                  }
//            collection.updateById(participant.partner._id, {$set: {yeses: yesList}} )
//              .success(function(doc){
//                var message = doc+" participant(s) were updated";
//                console.log(message);
//                if(!doc){
//                  res.json(500, {error: message});
//                } else {
                  res.json({success:"Participants updated.", participant:doc});
//                }
//              })
//              .error(function(err){
//                res.json(500, {error: 'There was a problem saving your answer: '+err});
//              });
          }
          play.responses.total++;
          if(participant.partner.answer === 'Yes!'){
            play.responses.yeses++;
          }
          if(participant.partner.answer === 'Maybe?'){
            play.responses.maybes++;
          }
          if(participant.partner.answer === 'No.'){
            play.responses.nos++;
          }
//          play.matrix[];
        })
        .error(function(err){
          res.json(500, {error: 'There was a problem saving your answer: '+err});
        });
    } else {
      res.json(500, NODATA);
    }
  };
};

exports.stats = function(db) {
  return function(req, res) {
//    var collection = db.get('___________');
//    collection.findOne({_id: configPair.key},{},function(e,docs){
    res.json([play]);
//    });
  };
};

exports.userlist = function(db) {
    return function(req, res) {
        var collection = db.get('usercollection');
        collection.find({},{},function(e,docs){
            res.render('userlist', {
                "userlist" : docs
            });
        });
    };
};
exports.newuser = function(req, res){
  res.render('newuser', { title: 'Add New User' });
};
exports.adduser = function(db) {
  return function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    // Set our collection
    var collection = db.get('usercollection');
    // Submit to the DB
    collection.insert({
      "username" : userName,
      "email" : userEmail
    }, function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
      } else {
        // If it worked, set the header so the address bar doesn't still say /adduser
        res.location("userlist");
        // And forward to success page
        res.redirect("userlist");
      }
    });
  }
}
