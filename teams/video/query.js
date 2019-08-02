var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
if (teamName == "undefined") {
  window.location.replace("/login");
}

var data = [];

firebase
  .firestore()
  .collection("moments")
  .where("team", "==", teamName)
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
