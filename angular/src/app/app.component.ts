import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectorRef, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProgressBarModule } from "primeng/progressbar";
import { isDevMode } from "@angular/core";
import { MessageModule } from "primeng/message";

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
export class AppComponent {
  loading: boolean = true;
  eventStatus: number = 1;
  isDevMode: boolean = isDevMode();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    window.electronAPI.setLoadingStatus(this.updateLoadingStatus.bind(this));
    window.electronAPI.setEventStatus(this.updateEventStatus.bind(this));
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
