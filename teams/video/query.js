var data = [];

firebase
  .firestore()
  .collection("moments")
  .where("team", "==", teamName)
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      data.push(doc.data());
    });
    console.log(data);
    renderTable();
  })
  .catch(function(error) {
    alert(error.message);
    window.location.replace("/login");
  });

var statsObj = {
  Hitter: ["EV", "LA", "Dist"],
  Pitcher: ["Pitch", "MPG", "RPM", "EFF"],
  Fielder: ["MPH", "StS", "GtC"],
  Runner: ["60", "1B", "SB"]
};

function renderTable() {
  var htmlOut = "";
  for (var moment of data) {
    // need to upload event name
    var { player, name, date, type } = moment;
    date = date.toDate();
    date = date.getMonth() + 1 + "/" + date.getDay() + "/" + date.getFullYear();
    htmlOut +=
      '<tr class="event"><td class="videoCell"><video><source type="video/*"></video></td><td class="nameCell">' +
      player +
      "</td><td>" +
      name +
      "</td><td>" +
      date +
      "</td><td>" +
      type +
      '</td><td>-</td><td>-</td><td>Expand<div class="expander"></div></td></tr>';
    for (var i = 0; i < moment.rounds.length; i++) {
      var round = moment.rounds[i];
      htmlOut +=
        '<tr class="round hidden"><td class="videoCell"><video><source type="video/*"></video></td><td class="nameCell">' +
        player +
        "</td><td>" +
        name +
        "</td><td>" +
        date +
        "</td><td>" +
        type +
        "</td><td>" +
        (i + 1) +
        "</td><td>-</td>";
      var possibleStats = statsObj[type];
      for (var stat of possibleStats) {
        htmlOut +=
          '<td class="stat">' + stat + '<div class="expander"></div></td>';
      }
      if (round.notes) {
        htmlOut += '<td><p class="note">' + round.notes + "</p></td></tr>";
      }
      for (var j = 0; j < round.pitches.length; j++) {
        var pitch = round.pitches[j];
        htmlOut +=
          '<tr class="pitch hidden"><td class="videoCell"><video><source type="video/*"></video></td><td class="nameCell">' +
          player +
          "</td><td>" +
          name +
          "</td><td>" +
          date +
          "</td><td>" +
          type +
          "</td><td>" +
          (i + 1) +
          "</td><td>" +
          (j + 1) +
          "</td>";
        for (var stat of possibleStats) {
          if (pitch.stats[stat.toLowerCase()]) {
            htmlOut +=
              '<td class="stat">' + pitch.stats[stat.toLowerCase()] + "</td>";
          } else {
            htmlOut += '<td class="stat">-</td>';
          }
        }
        htmlOut += "</tr>";
      }
    }
  }
  $("tr")
    .eq(0)
    .after(htmlOut);
  console.log(htmlOut);
}
