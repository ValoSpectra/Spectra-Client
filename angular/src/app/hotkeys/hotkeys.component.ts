import { Component } from "@angular/core";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-hotkeys",
  imports: [InputTextModule, FloatLabel],
  templateUrl: "./hotkeys.component.html",
  styleUrl: "./hotkeys.component.css",
})
export class HotkeysComponent {}
