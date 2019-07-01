var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
console.log(teamName);
if (teamName == "undefined") {
  window.location.replace("/login");
} else {
  $("h1").html("<span class='bold'>" + teamName + "</span>" + " - Players");
}

var players;

firebase
  .firestore()
  .collection("teams")
  .doc(teamName)
  .get()
  .then(function(doc) {
    var user = firebase.auth().currentUser;
    if (user === null || doc.data().coaches.indexOf(user.uid) == -1) {
      window.location.replace("/login");
    }
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
    window.location.replace("/login");
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
    .then(function() {
      firebase
        .firestore()
        .collection("teams")
        .doc(teamName)
        .update({
          players: firebase.firestore.FieldValue.arrayRemove(players[index])
        })
        .then(function() {
          $(".player")
            .eq(index)
            .remove();
        })
        .catch(function(error) {
          alert(error.message);
        });
    })
    .catch(function(error) {
      alert(error.message);
    });
});

$("#creatorLink").click(function() {
  window.location.href = "./creator/?name=" + encodeURI(teamName);
});

// thought (not whats happeing rn): user does not store which team(s) they are on. It's basically a follow request for the team

// but if we do that players cant write to teams

// var user = firebase.auth().currentUser;
// if (user === null) {
//     window.location.replace("/login");
// }

// firebase
//   .firestore()
//   .collection("users")
//   .doc(user.uid)
//   .get()
//   .then(function(doc) {
//     if (doc.data().role != "coach") {
//       window.location.replace("/login");
//     }
//   })
//   .catch(function(error) {
//     alert(error.message);
//   });
