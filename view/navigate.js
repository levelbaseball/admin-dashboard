$("#backRound").click(function() {
  setRound(roundNum - 1);
});

$("#forwardRound").click(function() {
  setRound(roundNum + 1);
});

function setRound(num) {
  roundNum = num;
  pitchNum = 0;
  setRoundInfo();
  disableElements();
  //setAngleSource();
}

$("#backPitch").click(function() {
  setPitch(pitchNum - 1);
});

$("#forwardPitch").click(function() {
  setPitch(pitchNum + 1);
});

function setPitch(num) {
  pitchNum = num;
  setRoundInfo();
  disableElements();
}
