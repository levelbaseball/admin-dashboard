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
      .catch(function(error) {
        alert(error.message);
        //console.log(JSON.parse(error.message));
      });
  } else {
    alert("please complete all fields");
  }
});
