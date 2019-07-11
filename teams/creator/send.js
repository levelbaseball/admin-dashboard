$("#send").click(async function() {
  var eventName = $("#eventName").val();
  var date = $("#date")
    .val()
    .replace("/", "-"); // to ensure date doesnt create weird routes
  if (masterData.length > 0) {
    for (var item of masterData) {
      var videos;
      if (item.videos) {
        videos = {
          angle1: null,
          angle2: null,
          split: null
        };
        console.log(item.videos, Object.keys(item.videos));
        for (var key of Object.keys(item.videos)) {
          var now = new Date();
          var video = item.videos[key];
          var route =
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
            "s";
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
      var doc = {
        player: item.player, // cannot be null
        type: item.type || null,
        round: parseInt(item.round) || null,
        notes: item.notes || null
      };
      docObj = Object.assign(doc, videos);
      console.log(docObj);
    }
  }
});
