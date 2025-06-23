import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { BasicInfo } from "../observer.component";
import { FormsModule } from "@angular/forms";
import { ElectronService } from "../../services/electron.service";
import { Validatable, ValidationState } from "../../services/validation.service";
import { ButtonModule, ButtonSeverity } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-observerinfo",
  imports: [
    FormsModule,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: "./observerinfo.component.html",
  styleUrl: "./observerinfo.component.css",
})
export class ObserverinfoComponent implements OnInit, Validatable, AfterContentInit {
  protected ingestServerOptions: string[] = ingestServerOptions;

  protected validatingKey: boolean = false;
  protected keyChangedWhileValidating: boolean = false;
  protected validationButtonLabel: string = "Validate";
  protected validationButtonIcon: string = "pi pi-question-circle";
  protected validationButtonSeverity: ButtonSeverity = "secondary";
  protected validationButtonBadge: string = "";

  protected debouncer: {
    timer: number;
    running: boolean;
  } = {
    running: false,
    timer: 0,
  };

  @Output()
  isSupporterChanged = new EventEmitter<boolean>();

  constructor(
    protected electron: ElectronService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.electron.playernameMessage.subscribe((name: string) => {
      this.data.name = name;
      this.changeDetectorRef.detectChanges();
    });
  }

  @Input({ required: true })
  data!: BasicInfo;

  ngAfterContentInit(): void {
    this.runValidation();
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    let valid: boolean = true;
    valid = this.data.key != "";
    valid = this.data.groupCode != "" && valid;
    valid = this.data.ingestIp != null && valid;
    this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
  }

  randomizeGroupcode() {
    let groupCode = "";
    for (let i = 0; i < 6; i++) {
      groupCode += validGroupcodeCharacters.charAt(
        Math.floor(Math.random() * validGroupcodeCharacters.length),
      );
    }
    this.data.groupCode = groupCode;
    this.runValidation();
  }

  //#region Access key validation
  accessKeyChanged() {
    if (this.validatingKey) {
      this.keyChangedWhileValidating = true;
      this.validatingKey = false;
    }
    this.validationButtonLabel = "Validate";
    this.validationButtonIcon = "pi pi-question-circle";
    this.validationButtonSeverity = "secondary";
    this.isSupporterChanged.emit(false);
  }

  async validateAccessKey() {
    if (
      this.validatingKey ||
      this.validationButtonSeverity != "secondary" ||
      this.debouncer.running
    ) {
      return;
    }
    this.validatingKey = true;
    this.startDebouncer();
    const response = await this.getOrgForKey(this.data.key);
    if (this.keyChangedWhileValidating) {
      this.keyChangedWhileValidating = false;
      return;
    }
    if (response.valid) {
      this.validationButtonLabel = "Valid";
      this.validationButtonIcon = "pi pi-check-circle";
      this.validationButtonSeverity = "success";
    } else {
      this.validationButtonLabel = "Invalid";
      this.validationButtonIcon = "pi pi-times-circle";
      this.validationButtonSeverity = "danger";
    }
    this.validatingKey = false;
    this.isSupporterChanged.emit(response.isSupporter);
  }

  async getOrgForKey(key: string): Promise<{ valid: boolean; isSupporter: boolean }> {
    return new Promise((resolve, reject) => {
      this.http
        .get<OrgInfo>("https://eu.valospectra.com:5101/getOrgForKey", {
          params: {
            key: key,
          },
        })
        .subscribe({
          next: (orgInfo) => {
            resolve({
              valid: true,
              isSupporter: orgInfo.isSupporter,
            });
          },
          error: () => {
            resolve({
              valid: false,
              isSupporter: false,
            });
          },
        });
    });
  }

  startDebouncer() {
    this.debouncer.running = true;
    this.debouncer.timer = 10;
    setTimeout(this.debouncerTimeout.bind(this), 1000);
  }

  debouncerTimeout() {
    this.debouncer.timer--;
    if (this.debouncer.timer > 0) {
      setTimeout(this.debouncerTimeout.bind(this), 1000);
    } else {
      this.debouncer.running = false;
    }
  }
  //#endregion
}

export const ingestServerOptions = ["eu.valospectra.com", "na.valospectra.com"];

// Uppercase letters and digits, excluding I and O to avoid confusion with other characters
const validGroupcodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

type OrgInfo = {
  id: string;
  name: string;
  isSupporter: boolean;
};
