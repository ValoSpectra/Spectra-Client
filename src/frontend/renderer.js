document.querySelector("#ConnectButton").addEventListener("click", () => {
  const obsName = document.getElementById("ValorantNameInput").value;
  const key = document.getElementById("KeyInput").value ? document.getElementById("KeyInput").value : "NONE";
  const groupCode = document.getElementById("GroupCodeInput").value;
  const ingestIp = document.getElementById("IngestIpInput").value;
  const teamLeftAttackerStart = document.getElementById(
    "TeamLeftAttackerStart"
  ).checked;

  const leftTeam = {
    name: document.getElementById("TeamLeftNameInput").value,
    tricode: document.getElementById("TeamLeftTricodeInput").value,
    url: document.getElementById("TeamLeftLogoInput").value,
    attackStart: teamLeftAttackerStart,
  };
  const rightTeam = {
    name: document.getElementById("TeamRightNameInput").value,
    tricode: document.getElementById("TeamRightTricodeInput").value,
    url: document.getElementById("TeamRightLogoInput").value,
    attackStart: !teamLeftAttackerStart,
  };

  window.electronAPI.processInputs(
    ingestIp,
    groupCode,
    obsName,
    leftTeam,
    rightTeam,
    key
  );
});

window.electronAPI.setPlayerName((value) => {
  const playerName = document.getElementById("ValorantNameInput");
  playerName.value = value;
});

window.electronAPI.setInputAllowed((value) => {
  const disableInput = !value;

  document.getElementById("KeyInput").disabled = disableInput;
  document.getElementById("GroupCodeInput").disabled = disableInput;
  document.getElementById("IngestIpInput").disabled = disableInput;

  document.getElementById("TeamLeftNameInput").disabled = disableInput;
  document.getElementById("TeamLeftTricodeInput").disabled = disableInput;
  document.getElementById("TeamLeftLogoInput").disabled = disableInput;
  document.getElementById("TeamLeftAttackerStart").disabled = disableInput;

  document.getElementById("TeamRightNameInput").disabled = disableInput;
  document.getElementById("TeamRightTricodeInput").disabled = disableInput;
  document.getElementById("TeamRightLogoInput").disabled = disableInput;

  document.getElementById("ConnectButton").disabled = disableInput;
});

window.electronAPI.loadConfig((config) => {
  const { key, groupCode, ingestIp, leftTeam, rightTeam } = config;

  if (key != "skip") {
    document.getElementById("KeyInput").value = key;
  }

  if (groupCode != "skip") {
    document.getElementById("GroupCodeInput").value = groupCode;
  }

  if (ingestIp != "skip") {
    document.getElementById("IngestIpInput").value = ingestIp;
  }

  if (leftTeam != "skip") {
    if (leftTeam.name != "skip") {
      document.getElementById("TeamLeftNameInput").value = leftTeam.name;
    }
    if (leftTeam.tricode != "skip") {
      document.getElementById("TeamLeftTricodeInput").value = leftTeam.tricode;
    }
    if (leftTeam.url != "skip") {
      document.getElementById("TeamLeftLogoInput").value = leftTeam.url;
    }
    if (leftTeam.attackStart != "skip" && typeof leftTeam.attackStart == "boolean") {
      document.getElementById("TeamLeftAttackerStart").checked =
        leftTeam.attackStart;
    }
  }

  if (rightTeam != "skip") {
    if (rightTeam.name != "skip") {
      document.getElementById("TeamRightNameInput").value = rightTeam.name;
    }
    if (rightTeam.tricode != "skip") {
      document.getElementById("TeamRightTricodeInput").value =
        rightTeam.tricode;
    }
    if (rightTeam.url != "skip") {
      document.getElementById("TeamRightLogoInput").value = rightTeam.url;
    }
    if (leftTeam.attackStart != "skip" && typeof leftTeam.attackStart == "boolean") {
      document.getElementById("TeamRightAttackerStart").checked =
        !leftTeam.attackStart;
    }
  }
});

let logText = "Debug Log:";
let debugConsole = document.getElementById("debugConsole");

window.electronAPI.addLogLine((value) => {
  logText += `\n[${value.level}] ${value.data.join(" ")}`;
  debugConsole.value = logText;
});

window.electronAPI.setStatus((value) => {
  document.getElementById("statusInput").value = value;
});

document.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  for (const f of event.dataTransfer.files) {
    window.electronAPI.processConfigDrop(f.path);
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});
