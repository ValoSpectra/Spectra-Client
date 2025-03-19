document.querySelector("#ConnectButton").addEventListener("click", () => {
  connect();
});

document.querySelector("#ShowTournamentInfo").addEventListener("change", () => {
  showHideTournament();
});

document.querySelector("#ShowMappoolInfo").addEventListener("change", () => {
  showHideMapPool();
});

document.querySelector("#Map1TimeSelect").addEventListener("change", () => {
  showHideMapDetails(1);
});

document.querySelector("#Map2TimeSelect").addEventListener("change", () => {
  showHideMapDetails(2);
});

document.querySelector("#Map3TimeSelect").addEventListener("change", () => {
  showHideMapDetails(3);
});

function connect() {
  const obsName = document.getElementById("ValorantNameInput").value;
  const key = document.getElementById("KeyInput").value
    ? document.getElementById("KeyInput").value
    : "NONE";
  const groupCode = document.getElementById("GroupCodeInput").value;
  const ingestIp = document.getElementById("IngestIpInput").value;
  const teamLeftAttackerStart = document.getElementById("TeamLeftAttackerStart").checked;

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
  const mapsNeeded = +document.getElementById("MapsNeededInput").value || 1;
  const mapsWonLeft = +document.getElementById("MapsWonLeftInput").value || 0;
  const mapsWonRight = +document.getElementById("MapsWonRightInput").value || 0;
  const mapWinInfo = { needed: mapsNeeded, wonLeft: mapsWonLeft, wonRight: mapsWonRight };
  const mapPoolInfo = getMappoolInfo();

  const seriesInfo = {
    ...mapWinInfo,
    mapInfo: mapPoolInfo,
  };

  const seedingLeft = document.getElementById("SeedingLeftInput").value || "";
  const seedingRight = document.getElementById("SeedingRightInput").value || "";

  const seedingInfo = {
    left: seedingLeft,
    right: seedingRight,
  };

  const tournamentInfo = getTournamentInfo();
  const emptyTournamentInfo = {
    name: "",
    logoUrl: "",
    backdropUrl: tournamentInfo.backdropUrl,
  };
  const tournamentInfoToSend = document.getElementById("ShowTournamentInfo").checked
    ? tournamentInfo
    : emptyTournamentInfo;

  const hotkeySpike = document.getElementById("hotkeySpikeInput").value || "";
  const hotkeyTechPause = document.getElementById("techPauseInput").value || "";
  const hotkeyLeftTimeout = document.getElementById("leftTimeoutInput").value || "";
  const hotkeyRightTimeout = document.getElementById("rightTimeoutInput").value || "";

  const hotkeys = {
    spikePlanted: hotkeySpike,
    techPause: hotkeyTechPause,
    leftTimeout: hotkeyLeftTimeout,
    rightTimeout: hotkeyRightTimeout,
  };

  const timeoutDuration = document.getElementById("timeoutDurationInput").value || 60;

  window.electronAPI.processInputs(
    ingestIp,
    groupCode,
    obsName,
    leftTeam,
    rightTeam,
    key,
    seriesInfo,
    seedingInfo,
    tournamentInfoToSend,
    hotkeys,
    timeoutDuration,
  );

  localStorage.setItem("key", key);
  localStorage.setItem("groupCode", groupCode);
  localStorage.setItem("ingestIp", ingestIp);
  localStorage.setItem("leftTeam", JSON.stringify(leftTeam));
  localStorage.setItem("rightTeam", JSON.stringify(rightTeam));
  localStorage.setItem(
    "tournamentInfoChecked",
    document.getElementById("ShowTournamentInfo").checked,
  );
  if (document.getElementById("ShowTournamentInfo").checked) {
    localStorage.setItem("tournamentInfo", JSON.stringify(tournamentInfo));
  }
  localStorage.setItem("mapPoolChecked", document.getElementById("ShowMappoolInfo").checked);
  localStorage.setItem("seriesInfo", JSON.stringify(seriesInfo));
  localStorage.setItem("seedingInfo", JSON.stringify(seedingInfo));
  localStorage.setItem("hotkeys", JSON.stringify(hotkeys));
  localStorage.setItem("timeoutDuration", JSON.stringify(timeoutDuration));
}

function getTournamentInfo() {
  const toReturn = {
    name: document.getElementById("TournamentNameInput").value || "Enable",
    logoUrl: document.getElementById("TournamentLogoInput").value || "",
    backdropUrl: document.getElementById("TournamentBackdropInput").value || "",
  };

  return toReturn;
}

function getMappoolInfo() {
  const mappool = [];

  if (document.getElementById("ShowMappoolInfo").checked == false) {
    return mappool;
  }

  const map1 = {
    type: document.getElementById("Map1TimeSelect").value,
  };

  if (map1.type == "past") {
    map1.map = document.getElementById("Map1NameInput").value;
    map1.left = {
      score: document.getElementById("Map1LeftScore").value || -1,
      logo: document.getElementById("TeamLeftLogoInput").value,
    };
    map1.right = {
      score: document.getElementById("Map1RightScore").value || -1,
      logo: document.getElementById("TeamRightLogoInput").value,
    };
  } else if (map1.type == "present") {
    const isLeft = document.getElementById("Map1LeftPicker").checked;
    if (isLeft) {
      map1.logo = document.getElementById("TeamLeftLogoInput").value;
    } else {
      map1.logo = document.getElementById("TeamRightLogoInput").value;
    }
  }
  mappool.push(map1);

  const map2 = {
    type: document.getElementById("Map2TimeSelect").value,
  };

  if (map2.type == "past") {
    map2.map = document.getElementById("Map2NameInput").value;
    map2.left = {
      score: document.getElementById("Map2LeftScore").value || -1,
      logo: document.getElementById("TeamLeftLogoInput").value,
    };
    map2.right = {
      score: document.getElementById("Map2RightScore").value || -1,
      logo: document.getElementById("TeamRightLogoInput").value,
    };
  } else if (map2.type == "present") {
    const isLeft = document.getElementById("Map2LeftPicker").checked;
    if (isLeft) {
      map2.logo = document.getElementById("TeamLeftLogoInput").value;
    } else {
      map2.logo = document.getElementById("TeamRightLogoInput").value;
    }
  } else if (map2.type == "future") {
    map2.map = document.getElementById("Map2NameInput").value;
    const isLeft = document.getElementById("Map2LeftPicker").checked;
    if (isLeft) {
      map2.logo = document.getElementById("TeamLeftLogoInput").value;
    } else {
      map2.logo = document.getElementById("TeamRightLogoInput").value;
    }
  }
  mappool.push(map2);

  const map3 = {
    type: document.getElementById("Map3TimeSelect").value,
  };

  if (map3.type == "present") {
    const isLeft = document.getElementById("Map3LeftPicker").checked;
    if (isLeft) {
      map3.logo = document.getElementById("TeamLeftLogoInput").value;
    } else {
      map3.logo = document.getElementById("TeamRightLogoInput").value;
    }
  } else if (map3.type == "future") {
    map3.map = document.getElementById("Map3NameInput").value;
    const isLeft = document.getElementById("Map3LeftPicker").checked;
    const isRight = document.getElementById("Map3RightPicker").checked;
    if (isLeft) {
      map3.logo = document.getElementById("TeamLeftLogoInput").value;
    } else if (isRight) {
      map3.logo = document.getElementById("TeamRightLogoInput").value;
    } else {
      map3.logo = "";
    }
  }
  mappool.push(map3);

  return mappool;
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
  document.getElementById("IngestIpInput").disabled = disableInput;

  document.getElementById("TeamLeftNameInput").disabled = disableInput;
  document.getElementById("TeamLeftTricodeInput").disabled = disableInput;
  document.getElementById("TeamLeftLogoInput").disabled = disableInput;
  document.getElementById("TeamLeftAttackerStart").disabled = disableInput;

  document.getElementById("TeamRightNameInput").disabled = disableInput;
  document.getElementById("TeamRightTricodeInput").disabled = disableInput;
  document.getElementById("TeamRightLogoInput").disabled = disableInput;

  document.getElementById("ConnectButton").disabled = disableInput;

  document.getElementById("MapsNeededInput").disabled = disableInput;
  document.getElementById("MapsWonLeftInput").disabled = disableInput;
  document.getElementById("MapsWonRightInput").disabled = disableInput;

  document.getElementById("SeedingLeftInput").disabled = disableInput;
  document.getElementById("SeedingRightInput").disabled = disableInput;

  document.getElementById("ShowTournamentInfo").disabled = disableInput;
  document.getElementById("TournamentNameInput").disabled = disableInput;
  document.getElementById("TournamentLogoInput").disabled = disableInput;
  document.getElementById("TournamentBackdropInput").disabled = disableInput;

  document.getElementById("ShowMappoolInfo").disabled = disableInput;

  document.getElementById("Map1TimeSelect").disabled = disableInput;
  document.getElementById("Map1NameInput").disabled = disableInput;
  document.getElementById("Map1LeftScore").disabled = disableInput;
  document.getElementById("Map1RightScore").disabled = disableInput;
  document.getElementById("Map1LeftPicker").disabled = disableInput;
  document.getElementById("Map1RightPicker").disabled = disableInput;

  document.getElementById("Map2TimeSelect").disabled = disableInput;
  document.getElementById("Map2NameInput").disabled = disableInput;
  document.getElementById("Map2LeftScore").disabled = disableInput;
  document.getElementById("Map2RightScore").disabled = disableInput;
  document.getElementById("Map2LeftPicker").disabled = disableInput;
  document.getElementById("Map2RightPicker").disabled = disableInput;

  document.getElementById("Map3TimeSelect").disabled = disableInput;
  document.getElementById("Map3NameInput").disabled = disableInput;
  document.getElementById("Map3LeftScore").disabled = disableInput;
  document.getElementById("Map3RightScore").disabled = disableInput;
  document.getElementById("Map3LeftPicker").disabled = disableInput;
  document.getElementById("Map3RightPicker").disabled = disableInput;

  document.getElementById("hotkeySpikeInput").disabled = disableInput;
  document.getElementById("techPauseInput").disabled = disableInput;
  document.getElementById("leftTimeoutInput").disabled = disableInput;
  document.getElementById("rightTimeoutInput").disabled = disableInput;

  document.getElementById("timeoutDurationInput").disabled = disableInput;
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
      document.getElementById("TeamLeftAttackerStart").checked = leftTeam.attackStart;
    }
  }

  if (rightTeam != "skip") {
    if (rightTeam.name != "skip") {
      document.getElementById("TeamRightNameInput").value = rightTeam.name;
    }
    if (rightTeam.tricode != "skip") {
      document.getElementById("TeamRightTricodeInput").value = rightTeam.tricode;
    }
    if (rightTeam.url != "skip") {
      document.getElementById("TeamRightLogoInput").value = rightTeam.url;
    }
    if (leftTeam.attackStart != "skip" && typeof leftTeam.attackStart == "boolean") {
      document.getElementById("TeamRightAttackerStart").checked = !leftTeam.attackStart;
    }
  }
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

function showHideMapPool() {
  const chkbox = document.getElementById("ShowMappoolInfo");
  const mappool1 = document.getElementById("Mappool1Info");
  const mappool2 = document.getElementById("Mappool2Info");
  const mappool3 = document.getElementById("Mappool3Info");

  mappool1.style.display = chkbox.checked ? "block" : "none";
  mappool2.style.display = chkbox.checked ? "block" : "none";
  mappool3.style.display = chkbox.checked ? "block" : "none";
}

function showHideTournament() {
  const chkbox = document.getElementById("ShowTournamentInfo");
  const roundwin1 = document.getElementById("TournamentNameInput");
  const roundwin2 = document.getElementById("TournamentLogoInput");
  const roundwin4 = document.getElementById("TournamentNameLabel");
  const roundwin5 = document.getElementById("TournamentLogoLabel");

  roundwin1.style.display = chkbox.checked ? "block" : "none";
  roundwin2.style.display = chkbox.checked ? "block" : "none";
  roundwin4.style.display = chkbox.checked ? "block" : "none";
  roundwin5.style.display = chkbox.checked ? "block" : "none";
}

function showHideMapDetails(map) {
  const down = document.getElementById(`Map${map}TimeSelect`);

  const score = document.getElementById(`Map${map}Scores`);
  const picker = document.getElementById(`Map${map}Picker`);
  const name = document.getElementById(`Map${map}Name`);

  score.style.display = down.value == "past" ? "block" : "none";
  picker.style.display = down.value == "past" ? "none" : "block";
  name.style.display = down.value == "present" ? "none" : "block";
}

function loadAll() {
  document.getElementById("KeyInput").value = localStorage.getItem("key") || "";
  document.getElementById("GroupCodeInput").value = localStorage.getItem("groupCode") || "";
  document.getElementById("IngestIpInput").value = localStorage.getItem("ingestIp") || "";

  const leftLoadTeam = JSON.parse(localStorage.getItem("leftTeam")) || undefined;
  if (leftLoadTeam) {
    document.getElementById("TeamLeftNameInput").value = leftLoadTeam.name || "";
    document.getElementById("TeamLeftTricodeInput").value = leftLoadTeam.tricode || "";
    document.getElementById("TeamLeftLogoInput").value = leftLoadTeam.url || "";
    document.getElementById("TeamLeftAttackerStart").checked = leftLoadTeam.attackStart || false;
  }

  const rightLoadTeam = JSON.parse(localStorage.getItem("rightTeam")) || undefined;
  if (rightLoadTeam) {
    document.getElementById("TeamRightNameInput").value = rightLoadTeam.name || "";
    document.getElementById("TeamRightTricodeInput").value = rightLoadTeam.tricode || "";
    document.getElementById("TeamRightLogoInput").value = rightLoadTeam.url || "";
    document.getElementById("TeamRightAttackerStart").checked = rightLoadTeam.attackStart || false;
  }

  const seriesInfo = JSON.parse(localStorage.getItem("seriesInfo")) || undefined;
  if (seriesInfo) {
    document.getElementById("MapsNeededInput").value = seriesInfo.needed || 1;
    document.getElementById("MapsWonLeftInput").value = seriesInfo.wonLeft || 0;
    document.getElementById("MapsWonRightInput").value = seriesInfo.wonRight || 0;
  }

  const seedingInfo = JSON.parse(localStorage.getItem("seedingInfo")) || undefined;
  if (seedingInfo) {
    document.getElementById("SeedingLeftInput").value = seedingInfo.left || "";
    document.getElementById("SeedingRightInput").value = seedingInfo.right || "";
  }

  const shouldTournamentInfoChecked = localStorage.getItem("tournamentInfoChecked");
  if (shouldTournamentInfoChecked) {
    const roundWinElement = document.getElementById("ShowTournamentInfo");
    if (shouldTournamentInfoChecked === "true") {
      roundWinElement.checked = shouldTournamentInfoChecked;
    }
    showHideTournament();
  }

  const tournamentInfo = JSON.parse(localStorage.getItem("tournamentInfo")) || undefined;
  if (tournamentInfo) {
    document.getElementById("TournamentNameInput").value = tournamentInfo.name || "";
    document.getElementById("TournamentLogoInput").value = tournamentInfo.logoUrl || "";
    document.getElementById("TournamentBackdropInput").value = tournamentInfo.backdropUrl || "";
  }

  const shouldMappoolChecked = localStorage.getItem("mapPoolChecked");
  if (shouldMappoolChecked) {
    const mapPoolElement = document.getElementById("ShowMappoolInfo");
    if (shouldMappoolChecked === "true") {
      mapPoolElement.checked = shouldMappoolChecked;
    }
    showHideMapPool();
  }

  document.getElementById("hotkeySpikeInput").value =
    JSON.parse(localStorage.getItem("hotkeys"))?.spikePlanted || "F9";

  document.getElementById("techPauseInput").value =
    JSON.parse(localStorage.getItem("hotkeys"))?.techPause || "F10";

  document.getElementById("leftTimeoutInput").value =
    JSON.parse(localStorage.getItem("hotkeys"))?.leftTimeout || "O";

  document.getElementById("rightTimeoutInput").value =
    JSON.parse(localStorage.getItem("hotkeys"))?.rightTimeout || "P";

  document.getElementById("timeoutDurationInput").value =
    JSON.parse(localStorage.getItem("timeoutDuration")) || 60;
}

loadAll();
