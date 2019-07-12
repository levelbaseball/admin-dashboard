$("#send").click(async function() {
  var eventName = $("#eventName").val();
  if (eventName == "") {
    alert("Please enter an event name");
    return;
  }
  var date = $("#date").val();
  if (!date) {
    alert("Date incorrectly formatted");
    return;
  }
  var timeStamp = getTimeStamp(date);
  var coaches;
  await firebase
    .firestore()
    .collection("teams")
    .doc(teamName)
    .get()
    .then(function(doc) {
      coaches = doc.data().coaches;
      console.log(coaches);
    })
    .catch(function(error) {
      alert(error.message);
    });
  if (masterData.length > 0) {
    for (var item of masterData) {
      var doc = {
        coaches: coaches,
        teamName: teamName,
        eventName: eventName,
        date: timeStamp
      };
      if (item.player) {
        doc.player = item.player;
        doc.playerID = getPlayerID(item.player);
      } else {
        alert("Player names must be set");
        return;
      }
      if (item.notes) {
        doc.notes = item.notes;
      }
      if (item.round) {
        doc.round = parseInt(item.round);
      }
      if (item.type) {
        doc.type = item.type;
      }
      if (item.pitches) {
        doc.pitches = item.pitches;
      }
      var videos;
      if (item.videos) {
        videos = {};
        console.log(item.videos, Object.keys(item.videos));
        for (var key of Object.keys(item.videos)) {
          var now = new Date();
          var video = item.videos[key];
          var route = getRoute(now);
          console.log(route);
          await firebase
            .storage()
            .ref()
            .child(route)
            .put(video)
            .then(function(snapshot) {
              console.log(snapshot);
              var newKey = key.replace(/\s+/g, "").toLowerCase();
              videos[newKey] = route; //snapshot.location.path_;
            })
            .catch(function(error) {
              alert(error.message);
            });
        }
      }
      docObj = Object.assign(doc, videos);
      console.log(docObj);
      await firebase
        .firestore()
        .collection("rounds")
        .doc(teamName + ", " + eventName + ", " + new Date())
        .set(docObj);
    }
  }
});

function getRoute(now) {
  return (
    "teams/" +
    teamName +
    "/" +
    now.getFullYear() +
    "/" +
    now.getMonth() +
    "-" +
    now.getDate() +
    "/" +
    now.getHours() +
    ":" +
    now.getMinutes() +
    "," +
    now.getMinutes() +
    "." +
    (now.getMilliseconds() / 1000 + "").substring(2) +
    "s"
  );
}

function getPlayerID(name) {
  for (var player of players) {
    if (player.name == name) {
      return player.id;
    }
  }
  return null;
}

function getTimeStamp(date) {
  var month = parseInt(date.substring(0, 2));
  var day = parseInt(date.substring(3, 5));
  var year = parseInt(date.substring(6, 10));
  var dateObj = new Date(year, month, day);
  try {
    var timeStamp = firebase.firestore.Timestamp.fromDate(dateObj); //use firestore timestamp class for querying purposes
  } catch {
    // something wrong with date formatting
    return null;
  }
  return timeStamp.seconds > 0 ? timeStamp : null;
}
