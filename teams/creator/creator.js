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
  .get()
  .then(function(doc) {
    if (!doc.exists) {
      alert(" doc does not exists");
      window.location.replace("/login");
    } else {
      players = doc.data().players;
    }
  })
  .catch(function(error) {});

$("body").on("click", ".select", function() {
  $(this)
    .closest(".selectionCells")
    .find(".selectionCover")
    .addClass("visible");
});

$("body").on("click", ".hideSelection", function() {
  $(this)
    .closest(".selectionCover")
    .removeClass("visible");
});
