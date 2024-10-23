import { IDailySessions } from "./IDailySessions";

export interface IUserData {
  user: string;
  dailySessions: IDailySessions[];
}

//todo : Add user config to save

export interface IUserConfig {
  showIdle : boolean
}