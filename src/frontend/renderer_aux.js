document.querySelector("#IngestServerSelect").addEventListener("change", () => {
  const ingestSelector = document.getElementById("IngestServerSelect").value;
  localStorage.setItem("auxIngestSelector", ingestSelector);
  showHideServerSelect();
});

function connect() {
  const name = document.getElementById("ValorantNameInput").value;

  const ingestSelector = document.getElementById("IngestServerSelect").value;
  let ingestIp =
    ingestSelector == "custom"
      ? document.getElementById("IngestIpInput").value
      : `${ingestSelector}.valospectra.com`;

  window.electronAPI.processAuxInputs(ingestIp, name);

  localStorage.setItem("auxIngestIp", document.getElementById("IngestIpInput").value);
}

window.electronAPI.setPlayerName((value) => {
  const playerName = document.getElementById("ValorantNameInput");
  playerName.value = value;
});

window.electronAPI.fireConnect(() => {
  connect();
});

window.electronAPI.setInputAllowed((value) => {
  const disableInput = !value;

  document.getElementById("KeyInput").disabled = disableInput;
  document.getElementById("GroupCodeInput").disabled = disableInput;
});

window.electronAPI.setStatus((value) => {
  document.getElementById("statusInput").value = value;
});

function showHideServerSelect() {
  const ddown = document.getElementById("IngestServerSelect");
  const label = document.getElementById("IngestIpInputLabel");
  const textfield = document.getElementById("IngestIpInput");

  label.style.display = ddown.value == "custom" ? "block" : "none";
  textfield.style.display = ddown.value == "custom" ? "block" : "none";
}

function loadAll() {
  const ingestSelect = localStorage.getItem("auxIngestSelector");
  document.getElementById("IngestServerSelect").value = ingestSelect || "eu";
  document.getElementById("IngestIpInput").value = localStorage.getItem("auxIngestIp") || "";

  showHideServerSelect();
}

loadAll();
