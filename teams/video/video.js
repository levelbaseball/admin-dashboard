var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
if (teamName == "undefined") {
  window.location.replace("/login");
}

firebase
  .firestore()
  .collection("sessions")
  .where("team", "==", teamName)
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log(doc.data());
    });
  })
  .catch(function(error) {
    alert(error.message);
    window.location.replace("/login");
  });

$("body").on("click", ".expander", function() {
  // if this has class expanded, flip all to up
  if ($(this).hasClass("expanded")) {
    $(this).removeClass("expanded");
  } else {
    $(this)
      .parent()
      .siblings()
      .find(".expander")
      .removeClass("expanded");
    $(this).addClass("expanded");
  }
});

$("#creatorLink").click(function() {
  window.location.href = "../creator/?name=" + encodeURI(teamName);
});

$("#teamLink").click(function() {
  window.location.href = "../?name=" + encodeURI(teamName);
});
