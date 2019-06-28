var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);
console.log(teamName);
if (teamName == "undefined") {
  window.location.replace("/login");
} else {
  $("h1").html("<span class='bold'>" + teamName + "</span>" + " - Players");
}

var players = [];

firebase
  .firestore()
  .collection("teams")
  .doc(teamName)
  .get()
  .then(function(doc) {
    if (!doc.exists) {
      alert(" doc does not exists");
      window.location.replace("/login");
    } else {
      players = doc.data().players;
    }
  })
  .catch(function(error) {});

var selectionTypeIndex; // 0 for player, 1 for type, 2 for round

$("body").on("click", ".select", function() {
  var section = $(this).closest(".section");
  selectionTypeIndex = section.index() - 1; // cover starts off children, need to adjust
  var cover = section.closest(".selectionCells").find(".selectionCover");
  $(".selectionCover p").each(function(i) {
    $(this).remove();
  });
  console.log(selectionTypeIndex);
  if (selectionTypeIndex == 0) {
    for (var player of players) {
      $("h6").after("<p>" + player.name + "</p>");
    }
  } else if (selectionTypeIndex == 1) {
    $("h6").after("<p>Hitter</p><p>Pitcher</p><p>Defense</p>");
  } else {
    $("h6").after("<p>1</p><p>2</p><p>3</p><p>4</p>");
  }
  cover.addClass("visible");
});

$("body").on("click", ".selectionCover p", function() {
  var text = $(this).text();
  $(".selectionCells .section")
    .eq(selectionTypeIndex + 0)
    .find(".select")
    .text(text);
  hideCover();
});

$("body").on("click", ".hideSelection", function() {
  hideCover();
});

function hideCover() {
  $(".selectionCover").removeClass("visible");
}
