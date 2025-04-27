import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProgressBarModule } from "primeng/progressbar";
import { isDevMode } from "@angular/core";
import { MessageModule } from "primeng/message";
import { ElectronService } from "./services/electron.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ProgressBarModule, MessageModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  animations: [
    trigger("loadingFade", [transition(":leave", animate("0.75s", style({ opacity: "0" })))]),
    trigger("eventFade", [
      transition(":enter", [style({ opacity: "0" }), animate("0.75s", style({ opacity: "1" }))]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  loading: boolean = true;
  eventStatus: number = 1;
  isDevMode: boolean = isDevMode();

  constructor(private changeDetectorRef: ChangeDetectorRef, protected electron: ElectronService) {
  }

  ngOnInit(): void {
    this.electron.loadingStatusMessage.subscribe(this.updateLoadingStatus.bind(this));
    this.electron.eventStatusMessage.subscribe(this.updateEventStatus.bind(this));
  }

  updateLoadingStatus(value: boolean) {
    this.loading = value;
    this.changeDetectorRef.detectChanges();
  }
  updateEventStatus(value: number) {
    this.eventStatus = value;
    this.changeDetectorRef.detectChanges();
  }
}
