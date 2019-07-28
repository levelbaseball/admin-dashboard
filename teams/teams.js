var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
console.log(teamName);
if (teamName == "undefined") {
  window.location.replace("/login");
} else {
  $("h1").html("<span class='bold'>" + teamName + "</span>" + " - Players");
}

var players = [];

firebase
  .firestore()
  .collection("teams")
  .doc(teamName)
  .collection("players")
  .get()
  .then(function(querySnapshot) {
    console.log(querySnapshot);
    querySnapshot.forEach(function(doc) {
      players.push(doc.id);
      $("#playersCont").append(
        '<div class="player"><p class="name">' +
          doc.data().name +
          '</p><p class="remove">remove</p></div>'
      );
    });
  })
  .catch(function(error) {
    console.log(firebase.auth().currentUser);
    alert(error);
    window.location.replace("/login");
  });

$("body").on("click", ".remove", function() {
  var index = $(this)
    .closest(".player")
    .index();
  var playerId = players[index];
  firebase
    .firestore()
    .collection("users")
    .doc(playerId)
    .update({
      teams: firebase.firestore.FieldValue.arrayRemove(teamName)
    })
    .then(function() {
      console.log("player profile updated");
      firebase
        .firestore()
        .collection("teams")
        .doc(teamName)
        .collection("players")
        .doc(playerId)
        .delete()
        .then(function() {
          console.log("team profile updated");
          //for now, keep coach in player profile for future flexibility
          $(".player")
            .eq(index)
            .remove();
        })
        .catch(function(error) {
          console.log("tried to remove from team");
          alert(error.message);
          /*

          try this for security rules:

          store players in collections

          all accessible in one query (uid, name, future properties)

          in security rules:

          || !(exists(databaseStuff/teams/$(teamName)/players/$(request.auth.uid)))


          */
        });
    })
    .catch(function(error) {
      console.log("tried to remove from player");
      alert(error.message);
    });
});

$("#videoLink").click(function() {
  window.location.href = "./video/?name=" + encodeURI(teamName);
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
