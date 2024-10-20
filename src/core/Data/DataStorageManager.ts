import * as vscode from "vscode";
import { IData } from "../IData";
import { userInfo } from "os";
import { SessionManager } from "../Sessions/SessionManager";
import { IDataStorage } from "./IDataStorage";
import { IUserData } from "../IUserData";
import { IDailySessions } from "../IDaylySessions";

export class DataStorageManager implements IDataStorage {
  private currentUser = userInfo().username;
  private static instance: DataStorageManager;
  private today: string = Date.now().toLocaleString();
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
      this.filePath = vscode.Uri.joinPath(
        wFolders[0].uri,
        vscode.workspace.getConfiguration("workingtimetracker").fileName
      ).path;
      this.loadData();
    }
  }
  loadData(): void {
    if (this.checkFilePath()) {
      vscode.workspace.fs.readFile(vscode.Uri.parse(this.filePath)).then(
        (value: Uint8Array) => {
          this.storage = JSON.parse(Buffer.from(value).toString("utf-8"));
          const data = this.findUserDataInfo();
          if (data !== undefined) {
            const currentData = this.findTodaysSessions(data);
            if (currentData !== undefined) {
              SessionManager.getInstance().loadManagedSessions(
                currentData.sessions
              );
              vscode.window.showInformationMessage(
                `Data for ${this.today} loaded succesfully.`
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
  saveData(): boolean {
    this.collectData();
    if (this.checkFilePath()) {
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
      return true;
    }
    return false;
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
  private checkFilePath(): boolean {
    const flag: boolean = this.filePath === "";
    if (flag) {
      vscode.window.showErrorMessage("There is no workspace opened!");
      return !flag;
    }
    vscode.workspace.fs.stat(vscode.Uri.parse(this.filePath)).then(
      () => {
        return !flag;
      },
      () => {
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
