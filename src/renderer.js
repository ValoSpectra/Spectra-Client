document.querySelector("#GroupCodeSubmit").addEventListener("click", () => {
  const inputField = document.getElementById("GroupCodeInput");
  window.electronAPI.setTrackId(inputField.value);
});
document.querySelector("#Replay").addEventListener("click", () => {
  window.electronAPI.replay();
});