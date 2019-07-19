var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
if (teamName == "undefined") {
  window.location.replace("/login");
}

firebase
  .firestore()
  .collection("sessions")
  .where("team", "==", teamName)
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log(doc.data());
    });
  })
  .catch(function(error) {
    alert(error.message);
    window.location.replace("/login");
  });

$("body").on("click", ".expander", function() {
  // if this has class expanded, flip all to up
  if ($(this).hasClass("expanded")) {
    $(this).removeClass("expanded");
    // collapse cells
    var row = $(this).closest("tr");
    collapseRow(row);
  } else {
    $(this)
      .parent()
      .siblings()
      .find(".expander")
      .removeClass("expanded");
    $(this).addClass("expanded");
    //expand cells
    var row = $(this).closest("tr");
    expandRow(row);
  }
  if (
    $(this)
      .closest("tr")
      .hasClass("round")
  ) {
    var sortBy = $(this)
      .parent()
      .text()
      .toLowerCase();
    console.log(sortBy);
  }
});

function collapseRow(row) {
  var type = row.attr("class");
  var startingIndex = row.index();
  for (var i = startingIndex + 1; i < $("tr").length; i++) {
    var currentRow = $("tr").eq(i);
    if (currentRow.hasClass("event")) {
      break;
    }
    currentRow.addClass("hidden");
  }
}

function expandRow(row) {
  var type = row.attr("class");
  var startingIndex = row.index();
  for (var i = startingIndex + 1; i < $("tr").length; i++) {
    var currentRow = $("tr").eq(i);
    if (currentRow.hasClass("event") || currentRow.hasClass("." + type)) {
      break;
    }
    currentRow.removeClass("hidden");
  }
}

$("#creatorLink").click(function() {
  window.location.href = "../creator/?name=" + encodeURI(teamName);
});

$("#teamLink").click(function() {
  window.location.href = "../?name=" + encodeURI(teamName);
});
