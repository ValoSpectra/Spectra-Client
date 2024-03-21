export class FormattingService {
    private static instance: FormattingService;

    private constructor() { };

    public static getInstance(): FormattingService {
        if (FormattingService.instance == null) FormattingService.instance = new FormattingService();
        return FormattingService.instance;
    }

    public formatScoreboardData(data: any): IFormattedData {
        const nameSplit = data.name.split(" #");

        let formatted: IFormattedScoreboard = {
            name: nameSplit[0],
            tagline: nameSplit[1],
            agentInternal: data.character,
            isAlive: data.alive,
            initialShield: data.shield * 25,
            scoreboardWeaponInternal: data.weapon,
            currUltPoints: data.ult_points,
            maxUltPoints: data.ult_max,
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

    public formatRosterData(data: any): IFormattedData {
        const nameSplit = data.name.split(" #");

        let formatted: IFormattedRoster = {
            name: nameSplit[0],
            tagline: nameSplit[1],
            agentInternal: data.character,
            locked: data.locked,
            rank: data.rank
        };
        const toReturn: IFormattedData = { type: DataTypes.ROSTER, data: formatted };

        return toReturn;
    }

}

export interface IFormattedScoreboard {
    name: string,
    tagline: string,
    agentInternal:string,
    isAlive: boolean,
    initialShield: number,
    scoreboardWeaponInternal: string,
    currUltPoints: number,
    maxUltPoints: number,
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
    agentInternal: string,
    locked: boolean,
    rank: number,
}

export interface IFormattedData {
    type: string,
    data: IFormattedScoreboard | IFormattedKillfeed | IFormattedRoster | boolean,
}

export enum DataTypes {
    SCOREBOARD = "scoreboard",
    KILLFEED = "killfeed",
    ROSTER = "roster",
    AUTH = "authenticate"
}