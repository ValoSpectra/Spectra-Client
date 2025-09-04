import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { PlayercamsInfo } from "../observer/observer.component";
import { ValidationState } from "../services/validation.service";
import { BlockableDiv } from "../blockablediv/blockablediv.component";
import { BlockUIModule } from "primeng/blockui";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { FormsModule } from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { HttpClient } from "@angular/common/http";
import { PasswordModule } from "primeng/password";
import { ElectronService } from "../services/electron.service";
import { LocalstorageService } from "../services/localstorage.service";

@Component({
  selector: "app-playercams",
  imports: [
    BlockableDiv,
    BlockUIModule,
    ToggleSwitchModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
  ],
  templateUrl: "./playercams.component.html",
  styleUrl: "./playercams.component.css",
})
export class PlayercamsComponent implements OnInit {
  private changeDetectorRef = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private electron = inject(ElectronService);
  private localStorageService = inject(LocalstorageService);

  @Input({ required: true })
  data!: PlayercamsInfo;

  @Input({ required: true })
  key!: string;

  tryingToConnect: boolean = false;
  errorMessage: string = "";
  endTimeMessage: string = "";

  ngOnInit() {
    if (this.data.endTime != 0 && this.data.endTime > Date.now()) {
      this.endTimeMessage =
        "Valid until " + new Date(this.data.endTime).toLocaleTimeString() + " your time.";
    }
    setInterval(() => {
      this.runValidation();
    }, 1000 * 60); // every minute
    this.runValidation();
  }

  protected onSessionClick() {
    this.tryingToConnect = true;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.tryingToConnect = false;
      this.changeDetectorRef.detectChanges();
    }, 2500);
    this.http
      .post(
        // "http://localhost:11300/api/createSession",
        "https://playercams.valospectra.com/api/createSession",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-Organization-Key": this.key,
          },
        },
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.tryingToConnect = false;
            this.changeDetectorRef.detectChanges();
            this.data.identifier = response.sessionIdentifier;
            this.data.secret = response.sessionSecret;
            this.data.endTime = Date.now() + 1000 * 60 * 60 * 6; // 6 hours from now
            this.errorMessage = "";
            this.endTimeMessage =
              "Your session has been created. Valid until " +
              new Date(this.data.endTime).toLocaleTimeString() +
              " your time.";
            this.electron.openExternalLink(
              // `http://localhost:11300/session/org/${response.sessionIdentifier}/${response.sessionSecret}`,
              `https://playercams.valospectra.com/session/org/${response.sessionIdentifier}/${response.sessionSecret}`,
            );
            this.runValidation();
            this.localStorageService.setItem("playercams", this.data);
          } else {
            this.errorMessage = "Could not connect to Playercam server.";
            console.error("Failed to create Playercam session:", response);
          }
        },
        error: (error) => {
          if (error.status === 0) {
            this.errorMessage = "Could not connect to Playercam server.";
          } else if (error.status === 401 || error.status === 403) {
            this.errorMessage = "Invalid organization key.";
          } else {
            this.errorMessage = `Error: ${error.status} - ${error.statusText}`;
          }
          console.error("Error creating Playercam session:", error);
        },
      });
  }

  onSessionBrowserClick() {
    if (this.data.identifier && this.data.secret) {
      this.electron.openExternalLink(
        `https://playercams.valospectra.com/session/org/${this.data.identifier}/${this.data.secret}`,
      );
    }
  }

  @Output()
  validationChanged = new EventEmitter<ValidationState>();
  runValidation() {
    if (this.data.enable) {
      let valid: boolean = true;
      if (!this.data.identifier || !this.data.secret) {
        valid = false;
      }
      if (this.data.endTime < Date.now()) {
        valid = false;
      }
      if (this.data.endTime == 0) {
        this.endTimeMessage = "No active session, create a new one to use this feature.";
      }
      this.validationChanged.emit(valid ? ValidationState.VALID : ValidationState.INVALID);
    } else {
      if (this.data.removeTricodes) {
        this.validationChanged.emit(ValidationState.VALID);
      } else {
        this.validationChanged.emit(ValidationState.OPTIONAL);
      }
    }
  }
}
