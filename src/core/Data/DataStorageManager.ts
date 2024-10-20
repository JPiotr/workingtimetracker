import * as vscode from "vscode";
import { IData } from "../IData";
import { SessionManager } from "../Sessions/SessionManager";
import { IDataStorage } from "./IDataStorage";
import { IUserData } from "../IUserData";
import { IDailySessions } from "../IDaylySessions";
import { UserInfoGetter } from "./UserInfoGetter";

export class DataStorageManager implements IDataStorage {
  private userInfoGetter = new UserInfoGetter();
  private currentUser: string = this.userInfoGetter.username;
  private static instance: DataStorageManager;
  private today: string = new Date(Date.now()).toLocaleString(
    Intl.Locale.name,
    { day: "numeric", month: "numeric", year: "numeric" }
  );
  private filePath: string = "";
  private storage: IData = {
    data: [],
  };
  static getInstance(): DataStorageManager {
    if (this.instance === undefined) {
      this.instance = new DataStorageManager();
    }
    return this.instance;
  }
  private constructor() {
    const wFolders = vscode.workspace.workspaceFolders;
    if (wFolders !== undefined) {
      this.userInfoGetter.getUsername().then((fullfilled) => {
        this.currentUser = fullfilled;
      });
      this.filePath = vscode.Uri.joinPath(
        wFolders[0].uri,
        vscode.workspace.getConfiguration("workingtimetracker").fileName
      ).path;
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
  private collectData(): void {
    const data = this.findUserDataInfo();
    if (data !== undefined) {
      const current = this.findTodaysSessions(data);
      if (current !== undefined) {
        current.sessions =
          SessionManager.getInstance().getCurrentlyManagedSessions();
      } else {
        data.daylySessions.push({
          date: this.today,
          sessions: SessionManager.getInstance().getCurrentlyManagedSessions(),
        });
      }
    } else {
      this.storage.data.push({
        user: this.currentUser,
        daylySessions: [
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
        vscode.window.showInformationMessage("There is no reqired file, creating new.")
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
    return userData.daylySessions.find((x) => x.date === this.today);
  }
}
