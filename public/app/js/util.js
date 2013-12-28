var i=1;
function register(){
  var participant = {
    number: i++,
    name: $('#participantName').val(),
    email: $('#participantEmail').val(),
    nameMatchesOk: true,
    emailMatchesOk: true
  };
  var posting = $.post("register", {participant: participant});
  posting.done(function(data) {
    if(data.error){
      //print error
    } else {
      $("#result").html('<h2>'+data.success+'</h2><br/><h4>Your number is: '+data.participant.number+'</h4>');
    }
  });
};