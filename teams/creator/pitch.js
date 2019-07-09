var selectedCellIndex = -1; // not set yet

$("body").on("click", ".cell:not(#last)", function(e) {
  $(".selectedCell").removeClass("selectedCell");
  $(this).addClass("selectedCell");
  selectedCellIndex = $(this).index();
});

var duration;
var info;

$("body").on("click", "#pitch", function(e) {
  if (selectedCellIndex > -1) {
    $("#pitch").replaceWith('<h2 id="back">Back</h2>');
    $("#send").replaceWith('<h2 id="save">Save</h2>');
    var player = "Player not set";
    var type = "Type not set";
    var round = "Round not set";
    if (selectedCellIndex < masterData.length) {
      // to avoid getting undefined when going straight for masterData[selectedCellIndex].yourkeyhere
      info = masterData[selectedCellIndex];
      if (info.player) {
        player = info.player;
      }
      if (info.type) {
        type = info.type;
      }
      if (info.round) {
        round = "Round: " + info.round;
      }
      if (info.videos) {
        var videos = info.videos;
        var file;
        if (videos["Angle 2"]) {
          file = videos["Angle 2"];
          loadTimeline(1, file);
        }
        if (videos["Angle 1"]) {
          file = videos["Angle 1"];
          loadTimeline(0, file);
        }
        if (videos["Split"]) {
          file = videos["Split"];
          loadTimeline(2, file);
        }
        // if (videos["Split"]) {
        //   file = videos["Split"];
        //   loadTimeline(2, file);
        // } else if (videos["Angle 1"]) {
        //   file = videos["Angle 1"];
        //   loadTimeline(0, file);
        // } else if (videos["Angle 2"]) {
        //   file = videos["Angle 2"];
        //   loadTimeline(1, file);
        // }
        var src = URL.createObjectURL(file);
        $("#pitchPrev").attr("src", src); //setting src on video tag just works, lets roll with it
        duration = document.getElementById("pitchPrev").duration;
      }
    }
    $("#playerName").text(player);
    $("#type").text(type);
    $("#round").text(round);
    $("#pitchScreen").addClass("visible");
    renderPitches();
  }
});

$("body").on("click", "#send", function(e) {});

$("body").on("click", "#back", function(e) {
  $("#back").replaceWith('<h2 id="pitch">Pitch</h2>');
  $("#save").replaceWith('<h2 id="send">Send</h2>');
  $("#pitchScreen").removeClass("visible");
});

function loadTimeline(index, file) {
  $(".timeline")
    .eq(index)
    .find("video")
    .each(function() {
      var video = $(this)[0];
      video.src = URL.createObjectURL(file);
      video.load();
      video.addEventListener(
        "loadeddata", //"loadedmetadata",
        function() {
          setVideoTime($(this));
        },
        false
      );
    });
}

function setVideoTime(element) {
  var video = element[0];
  var offset = element.offset().left - element.parent().offset().left;
  var percentAhead = offset / element.parent().width();
  var duration = video.duration;
  var currentTime = percentAhead * duration;
  video.currentTime = currentTime;
}

$(window).resize(function() {
  $(".timeline video").each(function() {
    setVideoTime($(this));
  });
});

$("#timelineWrapper").mousemove(function(e) {
  var mouseX = e.originalEvent.pageX;
  var video = $("#pitchPrev")[0];
  var duration = video.duration;
  var currentTime = (mouseX / $(".timeline").width()) * duration;
  // console.log(currentTime);
  video.currentTime = currentTime;
  $("#playHead").css("transform", "translateX(" + (mouseX + 0) + "px)");
});

var pitchStarted = false;
var clickedHeadPercent;

$("#timelineWrapper").click(function(e) {
  var mouseX = e.originalEvent.pageX;
  clickedHeadPercent = ((mouseX + 0) / $(this).width()) * 100;
  $("#clickedHead").css("left", clickedHeadPercent + "%");
  if (pitchStarted) {
    $("#markEnd").removeClass("disabled");
    $("#markStart").addClass("disabled");
  } else {
    $("#markEnd").addClass("disabled");
    $("#markStart").removeClass("disabled");
  }
});

var clickedStartPercent;
$("#markStart").click(function() {
  pitchStarted = !pitchStarted;
  $("#markStart").addClass("disabled");
  $("#markEnd").addClass("disabled");
  clickedStartPercent = clickedHeadPercent;
  $("#timelineWrapper").append("<div id='startMarker'></div>");
  $("#startMarker").css("left", clickedStartPercent + "%");
});

$("#markEnd").click(function() {
  pitchStarted = !pitchStarted;
  $("#markStart").addClass("disabled");
  $("#markEnd").addClass("disabled");
  var duration = $("#pitchPrev")[0].duration;
  var obj = {
    start: (clickedStartPercent * duration) / 100,
    end: (clickedHeadPercent * duration) / 100,
    startPercent: clickedStartPercent,
    endPercent: clickedHeadPercent
  };
  if (masterData[selectedCellIndex].pitches) {
    masterData[selectedCellIndex].pitches.push(obj);
  } else {
    masterData[selectedCellIndex].pitches = [obj];
  }
  $("#startMarker").remove();
  renderPitches();
});

function renderPitches() {
  $(".pitch").remove();
  var pitches = masterData[selectedCellIndex].pitches.sort(function(a, b) {
    return b.start - a.start;
  });
  console.log(pitches);
  //must sort array to add elements in correct indexes
  for (var pitch of pitches) {
    $("#timelineWrapper").append("<div class='pitch'></div>");
    console.log("pitch element made");
    $(".pitch:last-child").css({
      left: pitch.startPercent + "%",
      right: 100 - pitch.endPercent + "%"
    });
  }
}
