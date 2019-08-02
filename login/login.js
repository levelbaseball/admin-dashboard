console.log("login connected");

$("#login").click(function() {
  var email = $("#email").val();
  var password = $("#password").val();
  if (email.length > 0 && password.length > 0) {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(function() {
        console.log("signed in!");
        console.log(firebase.auth().currentUser);
      })
      .then(function() {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then(function(doc) {
            if (doc.data().role == "player") {
              console.log("go to player page");
              window.location.replace("../player/video");
            } else if (doc.data().role == "coach") {
              console.log("go to coach page");
              window.location.replace("../myteams");
            } else {
              alert("user not set up properly");
            }
          });
      })
      .catch(function(error) {
        alert(error.message);
        //console.log(JSON.parse(error.message));
      });
  } else {
    alert("please complete all fields");
  }
});
