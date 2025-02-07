!macro customInstall
      CreateShortCut "$SMPROGRAMS\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages"
      CreateShortCut "$SMPROGRAMS\[Player] Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages --auxiliary"
      CreateShortCut "$DESKTOP\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages"
      CreateShortCut "$DESKTOP\[Player] Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--owepm-packages-url=https://electronapi-qa.overwolf.com/packages --auxiliary"
!macroend