import * as vscode from "vscode";
import { IData } from "./IData";
import { SessionManager } from "../Sessions/SessionManager";
import { IDataStorage } from "./IDataStorage";
import { IUserData } from "./IUserData";
import { IDailySessions } from "./IDailySessions";
import { UserInfoGetter } from "./UserInfoGetter";
import { getActionTypeConfig, getSessionStateConfig } from "../../static/Utils";

export class DataStorageManager implements IDataStorage {
  private userInfoGetter = new UserInfoGetter();
  private currentUser: string = this.userInfoGetter.username;
  private static instance: DataStorageManager;
  private today!: string;
  private filePath: string = "";
  private storage: IData = {
    extConfig: {
      enums: [getActionTypeConfig(), getSessionStateConfig()],
    },
    data: [],
  };
  static currentWorkspace : vscode.Uri | undefined;

  static getInstance(): DataStorageManager {
    if (this.instance === undefined) {
      this.instance = new DataStorageManager();
    }
    DataStorageManager.currentWorkspace =
      vscode.workspace.workspaceFolders === undefined
        ? undefined
        : vscode.workspace.workspaceFolders[0].uri;
    this.instance.updateFilePath();
    this.instance.today = new Date(Date.now()).toLocaleString(
      Intl.Locale.name,
      { day: "numeric", month: "numeric", year: "numeric" }
    );
    return this.instance;
  }
  private constructor() {
    DataStorageManager.currentWorkspace =
    vscode.workspace.workspaceFolders === undefined
      ? undefined
      : vscode.workspace.workspaceFolders[0].uri;
    if (DataStorageManager.currentWorkspace !== undefined) {
      this.userInfoGetter.getUsername().then((fullfilled) => {
        this.currentUser = fullfilled;
      });
      this.updateFilePath();
      this.loadData();
    }
  }
  async loadData(): Promise<void> {
    if (await this.checkFilePath()) {
      vscode.workspace.fs.readFile(vscode.Uri.parse(this.filePath)).then(
        async (value: Uint8Array) => {
          this.storage = JSON.parse(Buffer.from(value).toString("utf-8"));
          await this.userInfoGetter.getUsername();
          const data = this.findUserDataInfo();
          if (data !== undefined) {
            const currentData = this.findTodaysSessions(data);
            if (currentData !== undefined) {
              SessionManager.getInstance().loadManagedSessions(
                currentData.sessions
              );
              vscode.window.showInformationMessage(
                `Data for ${this.today} loaded succesfully for user ${this.currentUser}.`
              );
            }
            vscode.window.showInformationMessage(
              `There are no data for today to load.`
            );
          }
        },
        (reason: string) => {
          vscode.window.showErrorMessage(`Cannot load data: ${reason}`);
        }
      );
    }
  }
  async saveData() {
    this.collectData();
    if (await this.checkFilePath()) {
      vscode.workspace.fs
        .writeFile(
          vscode.Uri.parse(this.filePath),
          Buffer.from(JSON.stringify(this.storage, null, 4))
        )
        .then(
          () => {
            vscode.window.showInformationMessage("Data saved succesfully.");
          },
          (reason: string) => {
            vscode.window.showErrorMessage(`Cannot save data: ${reason}`);
          }
        );
    }
  }
  updateFilePath(){
    if(DataStorageManager.currentWorkspace !== undefined){
      this.filePath = vscode.Uri.joinPath(
        DataStorageManager.currentWorkspace,
        vscode.workspace.getConfiguration("workingtimetracker").fileName
      ).path;
    }
  }
  private collectData(): void {
    const data = this.findUserDataInfo();
    if (data !== undefined) {
      const current = this.findTodaysSessions(data);
      if (current !== undefined) {
        current.sessions =
          SessionManager.getInstance().getCurrentlyManagedSessions();
      } else {
        data.dailySessions.push({
          date: this.today,
          sessions: SessionManager.getInstance().getCurrentlyManagedSessions(),
        });
      }
    } else {
      this.storage.data.push({
        config: {
          showIdle:
            vscode.workspace.getConfiguration("workingtimetracker").showIdle,
        },
        user: this.currentUser,
        dailySessions: [
          {
            date: this.today,
            sessions:
              SessionManager.getInstance().getCurrentlyManagedSessions(),
          },
        ],
      });
    }
  }
  private async checkFilePath(): Promise<boolean> {
    const flag: boolean = this.filePath === "";
    if (flag) {
      vscode.window.showErrorMessage("There is no workspace opened!");
      return !flag;
    }
    await vscode.workspace.fs.stat(vscode.Uri.parse(this.filePath)).then(
      () => {
        return !flag;
      },
      () => {
        vscode.window.showInformationMessage(
          "There is no reqired file, creating new."
        );
        vscode.workspace.fs.writeFile(
          vscode.Uri.parse(this.filePath),
          Buffer.from("")
        );
      }
    );
    return !flag;
  }
  private findUserDataInfo(): IUserData | undefined {
    return this.storage.data.find((x) => x.user === this.currentUser);
  }
  private findTodaysSessions(userData: IUserData): IDailySessions | undefined {
    return userData.dailySessions.find((x) => x.date === this.today);
  }
}
