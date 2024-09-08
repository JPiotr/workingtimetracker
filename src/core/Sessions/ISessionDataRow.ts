import { ActionType } from "../ActionType";
import { ISessionInfo } from "./ISessionInfo";

export interface ISessionDataRow {
    sessionInfo: ISessionInfo;
    actionType: ActionType;
}
