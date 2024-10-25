
import { IDailySessions } from "./IDailySessions";
import { IUserConfig } from "./IUserConfig";

export interface IUserData {
  user: string;
  config: IUserConfig;
  dailySessions: IDailySessions[];
}
