document.querySelector("#ConnectButton").addEventListener("click", () => {
  const obsName = document.getElementById("ValorantNameInput").value;
  const groupCode = document.getElementById("GroupCodeInput").value;
  const ingestIp = document.getElementById("IngestIpInput").value;

  const leftTeam = {name: document.getElementById("TeamLeftNameInput").value, tricode: document.getElementById("TeamLeftTricodeInput").value, url: document.getElementById("TeamLeftLogoInput").value};
  const rightTeam = {name: document.getElementById("TeamRightNameInput").value, tricode: document.getElementById("TeamRightTricodeInput").value, url: document.getElementById("TeamRightLogoInput").value};
  window.electronAPI.processInputs(ingestIp, groupCode, obsName, leftTeam, rightTeam);
});

window.electronAPI.setPlayerName((value) => {
  const playerName = document.getElementById("ValorantNameInput");
  playerName.value = value;
});