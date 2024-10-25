import { SessionState } from "./SessionState";

export interface ISessionDurationInfo {
  id: string;
  state: SessionState;
  begin: number | string;
  end: number | string;
  duration: number;
}
