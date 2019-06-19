if (!firebase.auth().currentUser) {
  console.log(firebase.auth().currentUser);
  window.location.replace("../login");
}

$(".cell").on("click", function() {
  if ($(this).is("#new")) {
    console.log("new team");
    $("#modal").addClass("onTop");
  } else {
    console.log("team pressed");
  }
});

$("#cancel").click(function() {
  $("#modal").removeClass("onTop");
});

$("#create").click(function() {
  var name = $("#nameInput").val();
  var imageUrl = $("#imageInput").val();
  if (name.length * imageUrl.length == 0) {
    alert("please fill all fields");
    return;
  }
  firebase
    .firestore()
    .collection("teams")
    .doc(name)
    .set({
      imageUrl: imageUrl,
      coaches: [firebase.auth().currentUser.uid]
    });
});
