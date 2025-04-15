import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectorRef, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProgressBarModule } from "primeng/progressbar";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ProgressBarModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  animations: [
    trigger("loadingFade", [transition(":leave", animate("0.75s", style({ opacity: "0" })))]),
  ],
})
export class AppComponent {
  loading: boolean = true;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    window.electronAPI.setLoadingStatus(this.updateLoadingStatus.bind(this));
  }

  updateLoadingStatus(value: boolean) {
    this.loading = value;
    this.changeDetectorRef.detectChanges();
  }
}
