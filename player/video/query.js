// if (!firebase.auth().currentUser) {
//   window.location.replace("/login");
// }

var data = [];

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get()
      .then(function(doc) {
        if (doc.data().role != "player") {
          alert("You are not a player");
          window.location.replace("/login");
          return;
        }
        firebase
          .firestore()
          .collection("moments")
          .where("playerID", "==", user.uid)
          .get()
          .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              data.push(
                Object.assign(doc.data(), {
                  fullName: doc.id
                })
              );
            });
            console.log(data);
            renderTable();
          })
          .catch(function(error) {
            alert(error.message);
            window.location.replace("/login");
          });
      })
      .catch(function(error) {
        alert(error.message);
        window.location.replace("/login");
      });
  } else {
    window.location.replace("/login");
  }
});
