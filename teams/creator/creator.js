var masterData = [];

var teamName;

teamName = decodeURIComponent(window.location.href.split("name=")[1]);

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
  var colIndex = $(this)
    .closest(".cell")
    .index();
  var properties = ["player", "type", "round"];
  if (colIndex < masterData.length) {
    //if col is not last
    var obj = masterData[colIndex];
    var property = properties[selectionTypeIndex];
    obj[property] = text;
  } else {
    addNewCell(); // need to create new cell at back
    var obj = {};
    obj[properties[selectionTypeIndex]] = text;
    masterData.push(obj);
  }
  console.log(masterData);
  $(this)
    .closest(".selectionCells")
    .find(".section")
    .eq(selectionTypeIndex + 0)
    .find(".select")
    .text(text);
  hideCover();
});

$("body").on("click", ".hideSelection", function() {
  hideCover();
});

$("body").on("change", ".videoInput", function(e) {
  var videoPlayer = $(this).siblings("video");
  videoPlayer.attr("src", URL.createObjectURL(this.files[0])); //setting src on video tag just works, lets roll with it
  videoPlayer.show();
  videoPlayer.load();
  videoPlayer.play();
  // for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {
  //   console.log($(this)[0].files);
  //   var file = e.originalEvent.srcElement.files[i];
  //   var fileURL = URL.createObjectURL(file);
  //   $(this)
  //     .find("source")
  //     .attr("src", fileURL);
  //   //console.log(file);
  //   // var reader = new FileReader();
  //   // console.log(reader);
  //   // reader.onloadend = function() {
  //   //   console.log(reader.result);
  //   // };
  //   // reader.readAsDataURL(file);
  // }
});

function hideCover() {
  $(".selectionCover").removeClass("visible");
}

function addNewCell() {
  $("#last").before(
    '<div class="cell"><div class="selectionCells"><div class="selectionCover"><h6 class="hideSelection">Cancel</h6></div><div class="section"><p>Player</p><p class="select">Select</p></div><div class="section"><p>Type</p><p class="select">Select</p></div><div class="section"><p>Round</p><p class="select">Select</p></div></div><div class="section angle"><p>Angle 1</p><div class="thumb"></div></div><div class="section angle"><p>Angle 2</p><div class="thumb"></div></div><div class="section angle"><p>Split</p><div class="thumb"></div></div></div>'
  );
}
