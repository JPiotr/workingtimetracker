import { ISessionDurationInfo } from "./ISessionDurationInfo";
import { SessionState } from "./SessionState";

export interface ISessionInfo {
    id : string;
    duration: number;
    state: SessionState;
    durations: ISessionDurationInfo[];
}
