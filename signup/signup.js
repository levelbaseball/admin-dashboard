$("#create").click(function() {
  var first = $("#first").val();
  var last = $("#last").val();
  var email = $("#email").val();
  var password1 = $("#password1").val();
  var password2 = $("#password2").val();
  var team = $("#team").val();
  if (
    first.length *
      last.length *
      email.length *
      password1.length *
      password2.length ==
    0
  ) {
    alert("please complete all fields");
    return;
  }
  if (password1 != password2) {
    alert("passwords do not match");
    return;
  }
  if (team == "") {
    signUp(first, last, email, password1, null);
  } else {
    firebase
      .firestore()
      .collection("teams")
      .doc(team)
      .get()
      .then(function(doc) {
        console.log("got doc");
        if (!doc.exists) {
          alert("that team does not exist");
        } else {
          signUp(first, last, email, password1, team);
        }
      })
      .catch(function(error) {
        console.log(error);
        alert(error.message);
      });
  }
});

function signUp(first, last, email, password, teamName) {
  console.log(first, last, email, password, teamName);
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(function() {
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: first + " " + last
      });
      console.log("name set");
      firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          id: user.uid,
          role: "player",
          teams: teamName ? [teamName] : []
        })
        .then(function() {
          firebase
            .firestore()
            .collection("teams")
            .doc(teamName)
            .update({
              players: firebase.firestore.FieldValue.arrayUnion(user.uid) //safe way to add to array
            })
            .then(function() {
              console.log("all success!");
              window.location.replace("../player");
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
}
