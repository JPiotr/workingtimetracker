import { ISessionDurationInfo } from "./ISessionDurationInfo";
import { SessionState } from "./SessionState";

export interface ISessionInfo {
  id: string;
  duration: number;
  idle : number;
  state: SessionState;
  durations: ISessionDurationInfo[];
  filesExt? : string[];
}
