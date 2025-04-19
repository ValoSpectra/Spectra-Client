import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { providePrimeNG } from "primeng/config";
import Aura from "@primeng/themes/aura";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { definePreset } from "@primeng/themes";
import { routes } from "./app.routes";

const theme = definePreset(Aura, {
  primitive: {
    test: "#ffcc00",
  },
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: "{sky.400}",
          hoverColor: "{sky.500}",
          activeColor: "{sky.700}",
        },
        content: {
          borderColor: "{surface.500}",
        },
        formField: {
          borderColor: "{surface.400}",
        },
      },
      dark: {
        primary: {
          color: "{sky.400}",
          hoverColor: "{sky.500}",
          activeColor: "{sky.700}",
        },
        content: {
          borderColor: "{surface.400}",
        },
        formField: {
          borderColor: "{surface.500}",
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: theme,
        options: {
          darkModeSelector: ".dark",
          cssLayer: {
            name: "primeng",
            order: "theme, base, primeng",
          },
        },
      },
    }),
  ],
};
