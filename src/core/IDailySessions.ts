import { ISessionDataRow } from "./Sessions/ISessionDataRow";

export interface IDailySessions {
  date: string;
  sessions: ISessionDataRow[];
}
