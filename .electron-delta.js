// .electron-delta.js
const DeltaBuilder = require("@electron-delta/builder");
const path = require("path");

const options = {
  productIconPath: path.join(__dirname, "/build/icon.ico"),
  productName: "Spectra Client",

  getPreviousReleases: async () => {
    return [
      {
        version: '0.2.1',
        url: 'https://github.com/ValoSpectra/Spectra-Client/releases/download/v0.2.1/Spectra-Client-Setup-0.2.1.exe'
      },
      {
        version: '0.2.0',
        url: 'https://github.com/ValoSpectra/Spectra-Client/releases/download/v0.2.0/Spectra.Client.Setup.0.2.0.exe'
      }
    ];
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