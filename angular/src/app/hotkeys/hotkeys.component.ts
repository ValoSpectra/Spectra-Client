import { Component, Input } from "@angular/core";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { Hotkeys } from "../observer/observer.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-hotkeys",
  imports: [FormsModule, InputTextModule, FloatLabel],
  templateUrl: "./hotkeys.component.html",
  styleUrl: "./hotkeys.component.css",
})
export class HotkeysComponent {
  @Input({ required: true })
  data!: Hotkeys;
}
