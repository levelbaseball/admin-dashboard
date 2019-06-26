var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
console.log(teamName);
if (teamName == "undefined") {
  window.location.replace("/login");
} else {
  $("h1").html("<span class='bold'>" + teamName + "</span>" + " - Players");
}

firebase
  .firestore()
  .collection("teams")
  .doc(teamName)
  .get()
  .then(function(doc) {
    if (!doc.exists) {
      alert(" doc does not exists");
      window.location.replace("/login");
    }
  })
  .catch(function(error) {});
