!include "nsDialogs.nsh"
!include "WinMessages.nsh"
!include "LogicLib.nsh"
!include "MUI2.nsh"

Var INST_OBSERVER_HANDLE
Var INST_PLAYER_HANDLE
Var INST_OBSERVER
Var INST_PLAYER
Var HWND_NEXT_BUTTON

Page custom ClientSelectionPage ClientSelectionLeave

Function UpdateNextButton
  ${NSD_GetState} $INST_OBSERVER_HANDLE $0
  ${NSD_GetState} $INST_PLAYER_HANDLE $1
  
  ${If} $0 == ${BST_UNCHECKED}
  ${AndIf} $1 == ${BST_UNCHECKED}
    GetDlgItem $HWND_NEXT_BUTTON $HWNDPARENT 1
    EnableWindow $HWND_NEXT_BUTTON 0
  ${Else}
    GetDlgItem $HWND_NEXT_BUTTON $HWNDPARENT 1
    EnableWindow $HWND_NEXT_BUTTON 1
  ${EndIf}
FunctionEnd

Function ObserverCheckboxClick
  Call UpdateNextButton
FunctionEnd

Function PlayerCheckboxClick
  Call UpdateNextButton
FunctionEnd

Function ClientSelectionPage
  !insertmacro MUI_HEADER_TEXT "Client Selection" "What client(s) would you like to install?"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0u 10u 100% 12u "Select which client(s) to install:"
  Pop $1

  ${NSD_CreateCheckbox} 0u 30u 100% 10u "Install Observer Client"
  Pop $INST_OBSERVER_HANDLE
  ${NSD_SetState} $INST_OBSERVER_HANDLE ${BST_UNCHECKED}
  ${NSD_OnClick} $INST_OBSERVER_HANDLE ObserverCheckboxClick

  ${NSD_CreateCheckbox} 0u 50u 100% 10u "Install Player Client"
  Pop $INST_PLAYER_HANDLE
  ${NSD_SetState} $INST_PLAYER_HANDLE ${BST_UNCHECKED}
  ${NSD_OnClick} $INST_PLAYER_HANDLE PlayerCheckboxClick

  Call UpdateNextButton
  nsDialogs::Show
FunctionEnd

Function ClientSelectionLeave
  ${NSD_GetState} $INST_OBSERVER_HANDLE $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $INST_OBSERVER "1"
  ${Else}
    StrCpy $INST_OBSERVER "0"
  ${EndIf}

  ${NSD_GetState} $INST_PLAYER_HANDLE $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $INST_PLAYER "1"
  ${Else}
    StrCpy $INST_PLAYER "0"
  ${EndIf}
FunctionEnd

!macro customInstall
      Delete "$SMPROGRAMS\Spectra Client.lnk"
      Delete "$SMPROGRAMS\[Player] Spectra Client.lnk"
      Delete "$DESKTOP\Spectra Client.lnk"
      Delete "$DESKTOP\[Player] Spectra Client.lnk"

      ${If} $INST_OBSERVER == "1"
        CreateShortCut "$SMPROGRAMS\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" ""
        CreateShortCut "$DESKTOP\Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" ""
      ${EndIf}

      ${If} $INST_PLAYER == "1"
        CreateShortCut "$SMPROGRAMS\[Player] Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--auxiliary"
        CreateShortCut "$DESKTOP\[Player] Spectra Client.lnk" "$INSTDIR\Spectra Client.exe" "--auxiliary"
      ${EndIf}
!macroend