// .electron-delta.js
const DeltaBuilder = require("@electron-delta/builder");
const path = require("path");

// Last 5 versions
const previousVersions = ["0.2.15", "0.2.14", "0.2.13", "0.2.12", "0.2.11"];

const options = {
  productIconPath: path.join(__dirname, "/build/icon.ico"),
  productName: "Spectra Client",

  getPreviousReleases: async () => {
    let previous = [];

    for (const version of previousVersions) {
      previous.push({
        version,
        url: `https://github.com/ValoSpectra/Spectra-Client/releases/download/v${version}/Spectra-Client-Setup-${version}.exe`,
      });
    }

    return previous;
  },
  sign: async (filePath) => {
    // sign each delta executable
  },
};

exports.default = async function (context) {
  const deltaInstallerFiles = await DeltaBuilder.build({
    context,
    options,
  });
  return deltaInstallerFiles;
};
