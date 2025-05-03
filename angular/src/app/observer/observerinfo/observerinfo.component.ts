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
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

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

  constructor(
    protected electron: ElectronService,
    protected changeDetectorRef: ChangeDetectorRef,
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
}

export const ingestServerOptions = ["eu.valospectra.com", "na.valospectra.com"];

// Uppercase letters and digits, excluding I and O to avoid confusion with other characters
const validGroupcodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
