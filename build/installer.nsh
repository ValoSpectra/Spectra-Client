!macro customInstall
      CreateShortCut "$SMPROGRAMS\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages"
      CreateShortCut "$DESKTOP\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages"
!macroend