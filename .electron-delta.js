// .electron-delta.js
const DeltaBuilder = require("@electron-delta/builder");
const path = require("path");

// Last 5 versions
const previousVersions = [
  "0.2.5",
  "0.2.4",
  "0.2.3",
  "0.2.2",
  "0.2.1"
];

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
