$("#create").click(function() {
  var first = $("#first").val();
  var last = $("#last").val();
  var email = $("#email").val();
  var password1 = $("#password1").val();
  var password2 = $("#password2").val();
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
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password1)
    .then(function() {
      console.log("user made!");
      var user = firebase.auth().currentUser;
      user.updateProfile({
        displayName: first + " " + last
      });
      firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          id: user.uid,
          role: "player"
        });
    })
    .catch(function(error) {
      alert(error.message);
    });
});
