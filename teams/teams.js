var teamName = decodeURIComponent(
  window.location.href.split("?")[1].split("=")[1]
);

$("h1").text(teamName + " - Players");

firebase
  .firestore()
  .collection("teams")
  .doc(teamName)
  .get()
  .then(function(doc) {
    var players = doc.data().players;
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
