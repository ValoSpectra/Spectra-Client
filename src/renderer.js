document.querySelector("#GroupCodeSubmit").addEventListener("click", () => {
  const inputField = document.getElementById("GroupCodeInput");
  window.electronAPI.setTrackId(inputField.value);
});
