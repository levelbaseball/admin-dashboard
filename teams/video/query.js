var selectedType = "Hitter";

var data = {};

$("h2").click(function() {
  selectedType = $(this).text();
  $("h2").removeClass("selected");
  $(this).addClass("selected");
  if (data[selectedType]) {
    console.log("no re=fetch");
    renderTable();
  } else {
    queryFirestore();
  }
});

function queryFirestore() {
  firebase
    .firestore()
    .collection("moments")
    .where("team", "==", teamName)
    .where("type", "==", selectedType)
    .get()
    .then(function(querySnapshot) {
      data[selectedType] = [];
      querySnapshot.forEach(function(doc) {
        data[selectedType].push(doc.data());
      });
      renderTable();
    })
    .catch(function(error) {
      alert(error.message);
      window.location.replace("/login");
    });
}

function renderTable() {
  console.log(data);
}

queryFirestore();
