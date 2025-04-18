import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { providePrimeNG } from "primeng/config";
import Aura from "@primeng/themes/aura";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { definePreset } from "@primeng/themes";
import { routes } from "./app.routes";

const theme = definePreset(Aura, {
  primitive: {
    test: "#00cc00"
  },
  semantic: {
    colorScheme: {
      light: {
        surface: {
        }
      },
      dark: {
        content: {
          borderColor: "{surface.500}"
        }
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
            order: "theme, base, primeng"
          }
        },
      },
    }),
  ],
};
