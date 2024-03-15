import { AgentNames } from "./agents";
import { WeaponNames } from "./weapons";

class RoundPhase {
    spikeDefused: boolean = false;
    value: "combat" | "end" | "game_start" | "shopping" = "game_start";
}