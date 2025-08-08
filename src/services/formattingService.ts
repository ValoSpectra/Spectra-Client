/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AuthTeam } from "./connectorService";

export class FormattingService {
  private static instance: FormattingService;

  private constructor() {}

  public static getInstance(): FormattingService {
    if (FormattingService.instance == null) FormattingService.instance = new FormattingService();
    return FormattingService.instance;
  }

  //#region Formatters
  public formatScoreboardData(data: any): IFormattedData {
    const nameSplit = data.name.split(" #");

    // In some GEPs, the spike is a boolean, in others it's a string
    let hasSpike = data.spike;
    if (typeof hasSpike !== "boolean") {
      hasSpike = data.spike === "TX_Hud_Bomb_S" ? true : false;
    }

    // Check for the potential rename from shield to armor
    let armorNum = 0;
    if (data.armor != undefined) {
      armorNum = data.armor;
    } else {
      armorNum = data.shield;
    }

    const formatted: IFormattedScoreboard = {
      name: nameSplit[0],
      tagline: nameSplit[1],
      playerId: data.player_id,
      startTeam: data.team,
      agentInternal: data.character,
      isAlive: data.alive,
      initialArmor: armorNum,
      scoreboardWeaponInternal: data.weapon,
      currUltPoints: data.ult_points,
      maxUltPoints: data.ult_max,
      hasSpike: hasSpike,
      money: data.money,
      kills: data.kills,
      deaths: data.deaths,
      assists: data.assists,
    };
    const toReturn: IFormattedData = { type: DataTypes.SCOREBOARD, data: formatted };

    return toReturn;
  }

  public formatKillfeedData(data: any): IFormattedData {
    const assists = [];
    data.assist1 !== "" ? assists.push(data.assist1) : undefined;
    data.assist2 !== "" ? assists.push(data.assist2) : undefined;
    data.assist3 !== "" ? assists.push(data.assist3) : undefined;
    data.assist4 !== "" ? assists.push(data.assist4) : undefined;

    const formatted: IFormattedKillfeed = {
      attacker: data.attacker,
      victim: data.victim,
      weaponKillfeedInternal: data.weapon,
      headshotKill: data.headshot,
      assists: assists,
      isTeamkill: data.is_victim_teammate,
    };
    const toReturn: IFormattedData = { type: DataTypes.KILLFEED, data: formatted };

    return toReturn;
  }

  public formatRosterData(data: any, rosterTag: string): IFormattedData {
    const nameSplit = data.name.split(" #");
    const positionStr = rosterTag.split("_")[1];

    const formatted: IFormattedRoster = {
      name: nameSplit[0],
      tagline: nameSplit[1] ? nameSplit[1] : "",
      startTeam: data.team,
      agentInternal: data.character,
      playerId: data.player_id,
      position: +positionStr,
      locked: data.locked,
      rank: data.rank,
    };
    const toReturn: IFormattedData = { type: DataTypes.ROSTER, data: formatted };

    return toReturn;
  }

  public formatRoundData(data: any, roundNum: number): IFormattedData {
    const formatted: IFormattedRoundInfo = {
      roundNumber: roundNum,
      roundPhase: data,
    };
    const toReturn: IFormattedData = { type: DataTypes.ROUND_INFO, data: formatted };

    return toReturn;
  }

  public formatAuxScoreboardData(data: any): IFormattedAuxScoreboardTeam {
    // In some GEPs, the spike is a boolean, in others it's a string
    let hasSpike = data.spike;
    if (typeof hasSpike !== "boolean") {
      hasSpike = data.spike === "TX_Hud_Bomb_S" ? true : false;
    }

    // Check for the potential rename from shield to armor
    let armorNum = 0;
    if (data.armor != undefined) {
      armorNum = data.armor;
    } else {
      armorNum = data.shield;
    }

    const formatted: IFormattedAuxScoreboardTeam = {
      playerId: data.player_id,
      agentInternal: data.character,
      isAlive: data.alive,
      initialArmor: armorNum,
      scoreboardWeaponInternal: data.weapon,
      currUltPoints: data.ult_points,
      maxUltPoints: data.ult_max,
      hasSpike: hasSpike,
      money: data.money,
      kills: data.kills,
      deaths: data.deaths,
      assists: data.assists,
    };

    return formatted;
  }
  //#endregion
}

export interface IFormattedScoreboard {
  name: string;
  tagline: string;
  playerId: string;
  startTeam: number;
  agentInternal: string;
  isAlive: boolean;
  initialArmor: number;
  scoreboardWeaponInternal: string;
  currUltPoints: number;
  maxUltPoints: number;
  hasSpike: boolean;
  money: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface IFormattedKillfeed {
  attacker: string;
  victim: string;
  weaponKillfeedInternal: string;
  headshotKill: boolean;
  assists: string[];
  isTeamkill: boolean;
}

export interface IFormattedRoster {
  name: string;
  tagline: string;
  startTeam: number;
  agentInternal: string;
  playerId: string;
  position: number;
  locked: boolean;
  rank: number;
}

export interface IFormattedRoundInfo {
  roundPhase: string;
  roundNumber: number;
}

export interface IFormattedScore {
  team_0: number;
  team_1: number;
}

export interface IFormattedData {
  type: string;
  data:
    | IFormattedScoreboard
    | IFormattedKillfeed
    | IFormattedRoster
    | IFormattedRoundInfo
    | IFormattedScore
    | IFormattedAbilities
    | IFormattedAuxScoreboardTeam
    | boolean
    | string
    | number;
}

export interface IAuthenticationData {
  type: DataTypes.AUTH;
  clientVersion: string;
  obsName: string;
  key: string;
  groupCode: string;
  leftTeam: AuthTeam;
  rightTeam: AuthTeam;
  toolsData: IToolsData;
}

//#region Auxiliary Data
export interface IAuxAuthenticationData {
  type: DataTypes.AUX_AUTH;
  clientVersion: string;
  name: string;
  matchId: string;
  playerId: string;
}

export interface IFormattedAbilities {
  grenade: number;
  ability_1: number;
  ability_2: number;
}

export interface IFormattedAuxScoreboardTeam {
  playerId: string;
  agentInternal: string;
  isAlive: boolean;
  initialArmor: number;
  scoreboardWeaponInternal: string;
  currUltPoints: number;
  maxUltPoints: number;
  hasSpike: boolean;
  money: number;
  kills: number;
  deaths: number;
  assists: number;
}
//#endregion

export enum DataTypes {
  SCOREBOARD = "scoreboard",
  KILLFEED = "killfeed",
  ROSTER = "roster",
  MATCH_START = "match_start",
  ROUND_INFO = "round_info",
  TEAM_IS_ATTACKER = "team_is_attacker",
  SCORE = "score",
  GAME_MODE = "game_mode",
  MAP = "map",
  OBSERVING = "observing",
  SPIKE_DETONATED = "spike_detonated",
  SPIKE_DEFUSED = "spike_defused",
  AUTH = "authenticate",
  // Auxiliary data types
  AUX_AUTH = "aux_authenticate",
  AUX_ABILITIES = "aux_abilities",
  AUX_HEALTH = "aux_health",
  AUX_SCOREBOARD = "aux_scoreboard",
  AUX_SCOREBOARD_TEAM = "aux_scoreboard_team",
  AUX_ASTRA_TARGETING = "aux_astra_targeting",
  AUX_CYPHER_CAM = "aux_cypher_cam",
  // Hotkey data types
  SPIKE_PLANTED = "spike_planted",
  TECH_PAUSE = "tech_pause",
  LEFT_TIMEOUT = "left_timeout",
  RIGHT_TIMEOUT = "right_timeout",
  SWITCH_KDA_CREDITS = "switch_kda_credits",
}

export enum SocketChannels {
  OBSERVER_LOGON = "obs_logon",
  OBSERVER_DATA = "obs_data",
  AUXILIARY_LOGON = "aux_logon",
  AUXILIARY_DATA = "aux_data",
}

//#region Tools Data
export interface IMapWinInfo {
  needed: number;
  wonLeft: number;
  wonRight: number;
}

export interface IToolsData {
  seriesInfo: ISeriesInfo;
  seedingInfo: ISeedingInfo;
  tournamentInfo: ITournamentInfo;
  timeoutDuration: number;
  sponsorInfo: SponsorInfo;
  watermarkInfo: WatermarkInfo;
}

export type ISeriesInfo = {
  needed: number;
  wonLeft: number;
  wonRight: number;
  mapInfo: MapPoolInfo[];
};

export type ISeedingInfo = {
  left: string;
  right: string;
};

export type ITournamentInfo = {
  name: string;
  logoUrl: string;
  backdropUrl: string;
  timeoutDuration: number;
};

export type SponsorInfo = {
  enabled: boolean;
  duration: number;
  sponsors: string[];
};

export type WatermarkInfo = {
  spectraWatermark: boolean;
  customTextEnabled: boolean;
  customText: string;
};

type BaseMapPoolInfo = {
  type: "past" | "present" | "future" | "error";
};

type PastMapPoolInfo = BaseMapPoolInfo & {
  type: "past";
  map: string;
  left: {
    logo: string;
    score: number;
  };
  right: {
    logo: string;
    score: number;
  };
};

type PresentMapPoolInfo = BaseMapPoolInfo & {
  type: "present";
  logo: string;
};

type FutureMapPoolInfo = BaseMapPoolInfo & {
  type: "future";
  map: string;
  logo: string;
};

type ErrorMapPoolInfo = BaseMapPoolInfo & {
  type: "error";
};

export type MapPoolInfo =
  | PastMapPoolInfo
  | PresentMapPoolInfo
  | FutureMapPoolInfo
  | ErrorMapPoolInfo;

//#endregion

export interface GEPStatus {
  game_id: number;
  state: 0 | 1 | 2 | 3;
  disabled: boolean;
  published: boolean;
  is_vgep: boolean;
  features: {
    name: string;
    state: 0 | 1 | 2 | 3;
    published: boolean;
    keys: [];
  }[];
}

export enum GEPStates {
  "unsupported" = 0,
  "green" = 1,
  "yellow" = 2,
  "red" = 3,
  "disabled" = 4,
}
