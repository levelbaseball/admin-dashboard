urlParams = getUrlVars();

var momentName = decodeURIComponent(urlParams["moment"]);
var roundNum = parseInt(urlParams["round"]) - 1;
var pitchNum = parseInt(urlParams["pitch"]) - 1;

if (momentName == "undefined") {
  alert(momentName);
  window.location.replace("/login");
}

$("h3").click(function() {
  $("h3").removeClass("selectedAngle");
  $(this).addClass("selectedAngle");
});

var data;

firebase
  .firestore()
  .collection("moments")
  .doc(momentName)
  .get()
  .then(function(doc) {
    if (!doc.exists) {
      alert("The moment '" + momentName + "' does not exist");
      return;
    }
    data = doc.data();
    showInfo();
  })
  .catch(function(error) {
    alert(error.message);
  });

function showInfo() {
  var date = data.date.toDate();
  $("h1").text(data.team);
  $("h2").text(
    data.player +
      ", " +
      data.type +
      ", " +
      (date.getMonth() + 1) +
      "/" +
      date.getDay() +
      "/" +
      date.getFullYear()
  );
  roundNum = Math.min(roundNum, data.rounds.length - 1);
  setRoundInfo();
  disableElements();
  //setAngleSource();
}

function disableElements() {
  var round = data.rounds[roundNum];
  console.log(roundNum);
  var roundSelected = false;
  if (!round.angle1) {
    $("h3")
      .eq(0)
      .addClass("disabled");
  } else {
    $("h3")
      .eq(0)
      .addClass("selectedAngle");
    roundSelected = true;
  }
  if (!round.angle2) {
    $("h3")
      .eq(1)
      .addClass("disabled");
  } else if (!roundSelected) {
    $("h3")
      .eq(1)
      .addClass("selectedAngle");
    roundSelected = true;
  }
  if (!round.angle3) {
    $("h3")
      .eq(2)
      .addClass("disabled");
  } else if (!roundSelected) {
    $("h3")
      .eq(2)
      .addClass("selectedAngle");
    roundSelected = true;
  }
  if (roundNum == 0) {
    $("#backRound").addClass("disabled");
  } else {
    $("#backRound").removeClass("disabled");
  }
  if (roundNum == data.rounds.length - 1) {
    $("#forwardRound").addClass("disabled");
  } else {
    $("#forwardRound").removeClass("disabled");
  }
  if (data.rounds[roundNum].pitches) {
    if (pitchNum == 0) {
      $("#backPitch").addClass("disabled");
    } else {
      $("#backPitch").removeClass("disabled");
    }
    if (pitchNum == data.rounds[roundNum].pitches.length - 1) {
      $("#forwardPitch").addClass("disabled");
    } else {
      $("#forwardPitch").removeClass("disabled");
    }
  } else {
    $(".switcher")
      .eq(1)
      .find("h4")
      .text("No Pitches");
    $(".switcher")
      .eq(1)
      .addClass("disabled");
  }
}

var startTime;
var endTime;

var roundHasPitches = false;

function setAngleSource() {
  var angle = $(".selectedAngle")
    .text()
    .toLowerCase()
    .replace(" ", "");
  storageRef = firebase.storage().ref(data.rounds[roundNum][angle]);
  storageRef
    .getDownloadURL()
    .then(function(downloadUrl) {
      var videoPlayer = $("video")[0];
      var currentTime = 0;
      videoPlayer.src = downloadUrl; /*+ "#t=10.123,15.123";*/
      if (data.rounds[roundNum].pitches) {
        var pitch = data.rounds[roundNum].pitches[pitchNum];
        videoPlayer.addEventListener(
          "loadedmetadata",
          function() {
            videoPlayer.currentTime = startTime;
          },
          false
        );
      }
    })
    .catch(function(error) {
      alert(error.message);
    });
}

function setRoundInfo() {
  if (data.rounds[roundNum].pitches) {
    var pitch = data.rounds[roundNum].pitches[pitchNum];
    startTime = pitch.start;
    endTime = pitch.end;
    roundHasPitches = true;
    $(".switcher")
      .eq(1)
      .find("h4")
      .text("Pitch: " + (pitchNum + 1));
    $("#stats").empty();
    for (var stat of Object.keys(pitch.stats)) {
      $("#stats").append(
        "<h5>" +
          formatStat(stat) +
          "<br><span>" +
          pitch.stats[stat] +
          "</span></h5>"
      );
    }
  } else {
    roundHasPitches = false;
  }
  $(".switcher")
    .eq(0)
    .find("h4")
    .text("Round: " + (roundNum + 1));
}

$("video")[0].addEventListener(
  "timeupdate",
  function() {
    if (
      roundHasPitches &&
      ($("video")[0].currentTime > endTime ||
        $("video")[0].currentTime < startTime - 0.1) // to prevent from being stuck at startTime
    ) {
      $("video")[0].currentTime = startTime;
      $("video")[0].play();
    }
  },
  false
);

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function formatStat(stat) {
  stat = stat.toUpperCase();
  if (stat.length == 3 && stat.charAt(1) == "T") {
    stat = stat.charAt(0) + "t" + stat.charAt(2);
  }
  return stat;
}

$("#pausePlay").click(function() {
  if ($("video")[0].paused) {
    $("video")[0].play();
  } else {
    $("video")[0].pause();
  }
});

$("#backFrame").click(function() {
  $("video")[0].currentTime -= 0.03; // one frame at 30 fps
});

$("#forwardFrame").click(function() {
  $("video")[0].currentTime += 0.03;
});
