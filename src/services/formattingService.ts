export class FormattingService {
    private static instance: FormattingService;


    private constructor() { };

    public static getInstance(): FormattingService {
        if (FormattingService.instance == null) FormattingService.instance = new FormattingService();
        return FormattingService.instance;
    }

    public formatScoreboardData(data: any): IFormattedData {
        const nameSplit = data.name.split(" #");

        let hasSpike = data.spike;
        if (typeof hasSpike !== "boolean") {
            hasSpike = data.spike === "TX_Hud_Bomb_S" ? true : false;
        }

        let formatted: IFormattedScoreboard = {
            name: nameSplit[0],
            tagline: nameSplit[1],
            playerId: data.player_id,
            startTeam: data.team,
            agentInternal: data.character,
            isAlive: data.alive,
            initialShield: data.shield,
            scoreboardWeaponInternal: data.weapon,
            currUltPoints: data.ult_points,
            maxUltPoints: data.ult_max,
            hasSpike: hasSpike,
            money: data.money,
            kills: data.kills,
            deaths: data.deaths,
            assists: data.assists
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

        let formatted: IFormattedKillfeed = {
            attacker: data.attacker,
            victim: data.victim,
            weaponKillfeedInternal: data.weapon,
            headshotKill: data.headshot,
            assists: assists,
            isTeamkill: data.is_victim_teammate
        };
        const toReturn: IFormattedData = { type: DataTypes.KILLFEED, data: formatted };

        return toReturn;
    }

    public formatRosterData(data: any, rosterTag: string): IFormattedData {
        const nameSplit = data.name.split(" #");
        const positionStr = rosterTag.split("_")[1];

        let formatted: IFormattedRoster = {
            name: nameSplit[0],
            tagline: nameSplit[1] ? nameSplit[1] : "",
            startTeam: data.team,
            agentInternal: data.character,
            playerId: data.player_id,
            position: +positionStr,
            locked: data.locked,
            rank: data.rank
        };
        const toReturn: IFormattedData = { type: DataTypes.ROSTER, data: formatted };

        return toReturn;
    }

    public formatRoundData(data: any, roundNum: number): IFormattedData {
        let formatted: IFormattedRoundInfo = {
            roundNumber: roundNum,
            roundPhase: data
        }
        const toReturn: IFormattedData = { type: DataTypes.ROUND_INFO, data: formatted }

        return toReturn;
    }

}

export interface IFormattedScoreboard {
    name: string,
    tagline: string,
    playerId: string,
    startTeam: number,
    agentInternal: string,
    isAlive: boolean,
    initialShield: number,
    scoreboardWeaponInternal: string,
    currUltPoints: number,
    maxUltPoints: number,
    hasSpike: boolean,
    money: number,
    kills: number,
    deaths: number,
    assists: number
}

export interface IFormattedKillfeed {
    attacker: string,
    victim: string,
    weaponKillfeedInternal: string,
    headshotKill: boolean,
    assists: string[],
    isTeamkill: boolean
}

export interface IFormattedRoster {
    name: string,
    tagline: string,
    startTeam: number,
    agentInternal: string,
    playerId: string,
    position: number,
    locked: boolean,
    rank: number,
}

export interface IFormattedRoundInfo {
    roundPhase: string,
    roundNumber: number
}

export interface IFormattedScore {
    team_0: number,
    team_1: number
}

export interface IFormattedData {
    type: string,
    data: IFormattedScoreboard | IFormattedKillfeed | IFormattedRoster | IFormattedRoundInfo | IFormattedScore | boolean,
}

export enum DataTypes {
    SCOREBOARD = "scoreboard",
    KILLFEED = "killfeed",
    ROSTER = "roster",
    MATCH_START = "match_start",
    ROUND_INFO = "round_info",
    TEAM_IS_ATTACKER = "team_is_attacker",
    SCORE = "score",
    MAP = "map",
    OBSERVING = "observing",
    SPIKE_PLANTED = "spike_planted",
    SPIKE_DETONATED = "spike_detonated",
    SPIKE_DEFUSED = "spike_defused",
    AUTH = "authenticate"
}