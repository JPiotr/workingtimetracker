import * as vscode from "vscode";
import { IData } from "./IData";
import { IDataStorage } from "./IDataStorage";
import { IUserData } from "./IUserData";
import { IDailySessions } from "./IDailySessions";
import { UserInfoGetter } from "./UserInfoGetter";
import { ISessionDataRow } from "../Sessions/ISessionDataRow";
import { getActionTypeConfig, getSessionStateConfig } from "../../static/Utils";
import { ActionType } from "../ActionType";
import { SessionState } from "../Sessions/SessionState";
import { SessionManager } from "../Sessions/SessionManager";

export class DataStorageManager implements IDataStorage {
  static currentWorkspace: vscode.Uri | undefined;
  private static instance: DataStorageManager;
  private userInfoGetter = new UserInfoGetter();
  private filePath: string = "";
  private currentUser: string = this.userInfoGetter.username;
  private today!: string;
  private todaySessions: ISessionDataRow[] = [];
  private dataLoaded: boolean = false;

  static getInstance(): DataStorageManager {
    if (this.instance === undefined) {
      this.instance = new DataStorageManager();
    }
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
  loadData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.checkFilePath()
        .then(() => {
          return this.userInfoGetter.getUsername();
        })
        .then(() => {
          return this.readFile();
        })
        .then((bytes: Uint8Array) => {
          return JSON.parse(Buffer.from(bytes).toString("utf-8"));
        })
        .then((data: IData) => {
          return this.findUserDataInfo(data);
        })
        .then((userData) => {
          return this.findTodaysSessions(userData);
        })
        .then((sessions) => {
          vscode.window.showInformationMessage(
            `Data of ${this.today} for ${this.currentUser} loaded sucessfully.`
          );
          this.loadTodaySessions(sessions.sessions);
          this.dataLoaded = true;
          resolve();
        })
        .catch((err) => {
          this.dataLoaded = false;
          vscode.window.showErrorMessage(err);
          if (err === `There is no required file!`) {
            this.createNewFile()
              .then((msg) => {
                vscode.window.showInformationMessage(msg);
              })
              .catch((err) => {
                vscode.window.showErrorMessage(err);
                reject();
              });
          }
          reject();
        });
    });
  }
  saveData(): Promise<void> {
    let sData: IData;
    let sUserData: IUserData;
    let enums = [getActionTypeConfig(), getSessionStateConfig()];
    if (!this.dataLoaded) {
      return new Promise<void>((resolve, reject) => {
        this.checkFilePath()
          .then(() => {
            let temp: ISessionDataRow[] = [];
            if (this.todaySessions.length > 0) {
              temp = [
                ...this.todaySessions,
                SessionManager.getInstance().getCurrentlyManagedSession(),
              ];
            } else {
              temp.push(
                SessionManager.getInstance().getCurrentlyManagedSession()
              );
            }

            const dataL: IData = {
              extConfig: {
                enums: enums,
              },
              data: [
                {
                  config:
                    vscode.workspace.getConfiguration("workingtimetracker")
                      .innerSessions.showIdle,
                  user: this.currentUser,
                  dailySessions: [
                    {
                      date: this.today,
                      sessions: temp,
                    },
                  ],
                },
              ],
            };
            return vscode.workspace.fs.writeFile(
              vscode.Uri.parse(this.filePath),
              Buffer.from(JSON.stringify(dataL, null, 4))
            );
          })
          .then(
            () => {
              vscode.window.showInformationMessage("Data saved succesfully.");
              resolve();
            },
            (reason: string) => {
              vscode.window.showErrorMessage(`Cannot save data: ${reason}`);
              reject();
            }
          );
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        this.checkFilePath()
          .then(() => {
            return this.readFile();
          })
          .then((bytes: Uint8Array) => {
            return JSON.parse(Buffer.from(bytes).toString("utf-8"));
          })
          .then((data: IData) => {
            sData = data;
            return this.findUserDataInfo(data);
          })
          .then((userData) => {
            sUserData = userData;
            return this.findTodaysSessions(userData);
          })
          .then((dSessions) => {
            let sessions: ISessionDataRow[] = dSessions.sessions;
            if (sData.extConfig.enums === enums) {
              enums = sData.extConfig.enums;
            }
            const temp: IUserData[] = [];
            if (sData.data.length > 1) {
              sData.data.forEach((x) => {
                if (x.user !== this.currentUser) {
                  temp.push(x);
                }
              });
            }
            const temp2: IDailySessions[] = [];
            if (sUserData.dailySessions.length > 1) {
              sUserData.dailySessions.forEach((x) => {
                if (x.date !== this.today) {
                  temp2.push(x);
                }
              });
            }
            if (this.todaySessions.length < dSessions.sessions.length) {
              sessions = this.todaySessions;
            }
            const dataL: IData = {
              extConfig: {
                enums: enums,
              },
              data: [
                ...temp,
                {
                  config: {
                    showIdle:
                      vscode.workspace.getConfiguration("workingtimetracker")
                        .innerSessions.showIdle,
                  },
                  user: sUserData.user,
                  dailySessions: [
                    ...temp2,
                    {
                      date: this.today,
                      sessions: [
                        ...sessions,
                        SessionManager.getInstance().getCurrentlyManagedSession(),
                      ],
                    },
                  ],
                },
              ],
            };
            return vscode.workspace.fs.writeFile(
              vscode.Uri.parse(this.filePath),
              Buffer.from(JSON.stringify(dataL, null, 4))
            );
          })
          .then(
            () => {
              vscode.window.showInformationMessage(
                `Data saved succesfully in workspace ${DataStorageManager.currentWorkspace}.`
              );
              resolve();
            },
            (reason: string) => {
              vscode.window.showErrorMessage(`Cannot save data: ${reason}`);
              reject();
            }
          );
      });
    }
  }
  updateFilePath() {
    if (DataStorageManager.currentWorkspace !== undefined) {
      this.filePath = vscode.Uri.joinPath(
        DataStorageManager.currentWorkspace,
        vscode.workspace.getConfiguration("workingtimetracker").fileName
      ).path;
    }
  }
  saveSession(session: ISessionDataRow) {
    this.todaySessions.push(session);
  }
  loadTodaySessions(sessions: ISessionDataRow[]) {
    if (!sessions.every((x) => x.sessionInfo.idle !== 0)) {
      sessions = sessions.filter(
        (x) => x.sessionInfo.durations.length > 0 && x.sessionInfo.idle > 0
      );
    }
    if (
      sessions.length > 0 &&
      sessions[sessions.length - 1].actionType !== ActionType.Stop
    ) {
      const lastNotStoppedSession = sessions[sessions.length - 1];
      lastNotStoppedSession.sessionInfo.state = SessionState.Ended;
    }
    this.todaySessions = sessions;
  }
  private workspaceIsOpened(): boolean {
    if (vscode.workspace.workspaceFolders === undefined) {
      return false;
    }
    return true;
  }
  private checkFilePath(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.workspaceIsOpened()) {
        reject(`There is no workspace opened!`);
      }
      vscode.workspace.fs.stat(vscode.Uri.parse(this.filePath)).then(
        () => {
          resolve();
        },
        () => {
          reject(`There is no required file!`);
        }
      );
    });
  }
  private createNewFile(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      vscode.workspace.fs
        .writeFile(vscode.Uri.parse(this.filePath), Buffer.from(""))
        .then(
          () => {
            resolve(
              `File ${
                vscode.workspace.getConfiguration("workingtimetracker").fileName
              } created successfully.`
            );
          },
          () => {
            reject(`Cannot create file.`);
          }
        );
    });
  }
  private findUserDataInfo(source: IData): Promise<IUserData> {
    return new Promise<IUserData>((resolve, reject) => {
      const temp = source.data.find((x) => x.user === this.currentUser);
      if (temp !== undefined) {
        resolve(temp);
      }
      reject(`Cannot find data for ${this.currentUser} user.`);
    });
  }
  private findTodaysSessions(userData: IUserData): Promise<IDailySessions> {
    return new Promise<IDailySessions>((resolve, reject) => {
      const temp = userData.dailySessions.find((x) => x.date === this.today);
      if (temp !== undefined) {
        resolve(temp);
      }
      reject(`Cannot find data for ${this.today} (today).`);
    });
  }
  resetStorage() {
    this.todaySessions = [];
  }
  private readFile(): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, rejects) => {
      vscode.workspace.fs.readFile(vscode.Uri.parse(this.filePath)).then(
        (value) => {
          if (value.length == 0) {
            rejects(`There is no data to load.`);
          }
          resolve(value);
        },
        (err) => {
          rejects(err);
        }
      );
    });
  }
}
