import { IDataConfig } from "./IDataConfig";
import { IUserData } from "./IUserData";

export interface IData {
  extConfig: IDataConfig;
  data: IUserData[];
}
