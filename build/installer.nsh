!macro customInstall
      CreateShortCut "$SMSTARTUP\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages"
      CreateShortCut "$DESKTOP\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages"
!macroend