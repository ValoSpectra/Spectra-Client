import { Routes } from "@angular/router";
import { ObserverComponent } from "./observer/observer.component";
import { AuxiliaryComponent } from "./AuxiliaryComponent/auxiliary.component";
import { SupportusComponent } from "./supportus/supportus.component";

export const routes: Routes = [
  {
    path: "",
    component: ObserverComponent,
  },
  {
    path: "auxiliary",
    component: AuxiliaryComponent,
  },
  {
    path: "support",
    component: SupportusComponent,
  },
];
