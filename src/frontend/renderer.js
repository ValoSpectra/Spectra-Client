document.querySelector("#ConnectButton").addEventListener("click", () => {
  const playerName = document.getElementById("ValorantNameInput").value;
  const teamName = document.getElementById("TeamNameInput").value;
  const groupId = document.getElementById("GroupCodeInput").value;
  window.electronAPI.processInputs(groupId, teamName, playerName);
});
document.querySelector("#Replay").addEventListener("click", () => {
  window.electronAPI.replay();
});

window.electronAPI.setPlayerName((value) => {
  const playerName = document.getElementById("ValorantNameInput");
  playerName.value = value;
});