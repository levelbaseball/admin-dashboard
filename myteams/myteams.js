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
      firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get()
        .then(async function(doc) {
          var teams = doc.data().teams;
          var logoRoutes = [];
          for (var team of teams) {
            await firebase
              .firestore()
              .collection("teams")
              .doc(team)
              .get()
              .then(function(doc) {
                logoRoutes.push(doc.data().logo);
                $("#new").after(
                  "<div class='cell' ><div class='thumb'></div><p>" +
                    doc.id +
                    "</p></div>"
                );
              });
          }
          for (var i = 0; i < logoRoutes.length; i++) {
            var logoRoute = logoRoutes[i];
            if (logoRoute) {
              await firebase
                .storage()
                .ref(logoRoute)
                .getDownloadURL()
                .then(function(downloadUrl) {
                  $(".thumb")
                    .eq(i)
                    .css("background-image", "url(" + downloadUrl + ")");
                })
                .catch(function(error) {
                  alert(error.message);
                });
            }
          }
        });
    })
    .catch(function(error) {
      alert(error.message);
    });
});

function previewPhoto() {
  var file = $("#imageInput")[0].files[0];
  var src = URL.createObjectURL(file);
  console.log("got here 1");
  $("#photoPreview").css({
    "background-image": "url('" + src + "')"
  });
  console.log("got here 2");
}

$("#imageInput").on("change", function() {
  previewPhoto();
});

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
    console.log(firebase.auth().currentUser);
    window.location.href = url;
  }
});

$("#cancel").click(function() {
  $("#modal").removeClass("onTop");
});

$("#create").click(async function() {
  var name = $("#nameInput").val();
  if (name.length == 0) {
    alert("please enter team name");
    return;
  }
  var route = "teams/" + name + "/logo";
  await firebase
    .storage()
    .ref()
    .child(route)
    .put($("#imageInput")[0].files[0])
    .then(function(snapshot) {
      console.log(snapshot);
      firebase
        .firestore()
        .collection("teams")
        .doc(name)
        .set({
          logo: route,
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
              location.reload(); // reload page to see updated UI
            })
            .catch(function(error) {
              alert(error.message);
            });
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
