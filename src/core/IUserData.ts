import { ISessionDataRow } from "./Sessions/ISessionDataRow";


export interface IUserData {
    user: string;
    sessions: ISessionDataRow[];
}
