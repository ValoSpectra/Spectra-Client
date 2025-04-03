!macro customInstall
      Delete "$SMPROGRAMS\Spectra Client.lnk"
      Delete "$SMPROGRAMS\[Player] Spectra Client.lnk"
      Delete "$DESKTOP\Spectra Client.lnk"
      Delete "$DESKTOP\[Player] Spectra Client.lnk"

      CreateShortCut "$SMPROGRAMS\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe"
      CreateShortCut "$SMPROGRAMS\[Player] Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--auxiliary"
      CreateShortCut "$DESKTOP\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe"
      CreateShortCut "$DESKTOP\[Player] Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--auxiliary"
!macroend