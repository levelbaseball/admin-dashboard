firebase.auth().onAuthStateChanged(function(user) {
  console.log("user change");
  if (!user) {
    window.location.replace("../login");
  }
  var role;
  firebase
    .firestore()
    .collection("users")
    .doc(user.uid)
    .get()
    .then(function(doc) {
      role = doc.data().role;
    })
    .then(function() {
      if (role != "coach") {
        window.location.replace("../login");
      }
      console.log("got here 1");
      firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get()
        .then(function(doc) {
          var teams = doc.data().teams;
          for (var team of teams) {
            console.log(team);
            firebase
              .firestore()
              .collection("teams")
              .doc(team)
              .get()
              .then(function(doc) {
                console.log(doc);
                //console.log(doc.data());
                $("#new").after(
                  "<div class='cell' ><div class='thumb' style='background-image:url(" +
                    doc.data().imageUrl +
                    ");' ></div><p>" +
                    doc.id +
                    "</p></div>"
                );
              });
          }
        });
    })
    .catch(function(error) {
      alert(error.message);
    });
});

function previewPhoto() {
  $("#photoPreview").css({
    "background-image": "url('" + $("#imageInput").val() + "')"
  });
}

$("body").on("click", ".cell", function() {
  console.log("clickkkkkk");
  if ($(this).is("#new")) {
    console.log("new team");
    $("#modal").addClass("onTop");
  } else {
    console.log("team pressed");
    var name = $(this)
      .find("p")
      .text();
    var url = "../teams/?name=" + encodeURI(name);
    console.log(url);
    window.location.href = url;
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
  firebase //security rules. can write if doc does not exist or coach is listed in coaches
    .firestore()
    .collection("teams")
    .doc(name)
    .set({
      imageUrl: imageUrl,
      coaches: [firebase.auth().currentUser.uid],
      players: []
    })
    .then(function() {
      firebase
        .firestore()
        .collection("users")
        .doc(firebase.auth().currentUser.uid)
        .update({
          teams: firebase.firestore.FieldValue.arrayUnion(name) //safe way to add to array
        })
        .then(function() {
          location.reload();
        })
        .catch(function(error) {
          alert(error.message);
        });
    })
    .catch(function(error) {
      alert(error.message);
    });
});

//when redirecting to team page, coaches can only access if the team has them listed as a coach too.
