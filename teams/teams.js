var teamName = decodeURIComponent(
  window.location.href.split("?")[1].split("=")[1]
);

$("h1").text(teamName + " - Players");

var players;

firebase
  .firestore()
  .collection("teams")
  .doc(teamName)
  .get()
  .then(function(doc) {
    players = doc.data().players;
    for (var player of players) {
      $("#playersCont").append(
        '<div class="player"><p class="name">' +
          player.name +
          '</p><p class="remove">remove</p></div>'
      );
    }
  })
  .catch(function(error) {
    alert(error.message);
  });

$("body").on("click", ".remove", function() {
  var index = $(this)
    .closest(".player")
    .index();
  var playerId = players[index].id;
  firebase
    .firestore()
    .collection("users")
    .doc(playerId)
    .update({
      teams: firebase.firestore.FieldValue.arrayRemove(teamName)
    })
    .catch(function(error) {
      alert(error.message);
    });
  // firebase.firstore().collection("teams").doc(teamName).update({
  //     players: firebase.firestore.FieldValue.arrayRemove(playerId)
  // })
});

// thought: user does not store which team(s) they are on. It's basically a follow request for the team

// but if we do that players cant write to teams
