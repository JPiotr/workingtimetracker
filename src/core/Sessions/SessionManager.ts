import { ISessionDataRow } from "./ISessionDataRow";
import { ActionType } from "../ActionType";
import { Session } from "./Session";
import * as vscode from "vscode";

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: Session;
  private oldSession!: Session;
  private currentAction: ActionType = ActionType.Idle;
  private managedSessions: ISessionDataRow[] = [];
  private static registerIdle =
    vscode.workspace.getConfiguration("workingtimetracker").innerSessions
      .registerIdle;

  static getInstance(): SessionManager {
    if (this.instance === undefined) {
      this.instance = new SessionManager();
    }
    this.registerIdle =
      vscode.workspace.getConfiguration(
        "workingtimetracker"
      ).innerSessions.registerIdle;
    return this.instance;
  }
  private constructor() {
    this.currentSession = new Session();
  }
  menageSession(actionType: ActionType): ISessionDataRow {
    switch (actionType) {
      case ActionType.Codding:
      case ActionType.Debugging:
      case ActionType.Documenting:
      case ActionType.Building:
      case ActionType.Testing:
        this.createNewSession(actionType);
        this.currentSession.start();
        return {
          actionType: this.currentAction,
          sessionInfo: this.currentSession.getSessionInfo(
            SessionManager.registerIdle
          ),
        };
      case ActionType.Idle:
        this.currentSession.idle();
        this.currentAction = actionType;
        return {
          actionType: this.currentAction,
          sessionInfo: this.currentSession.getSessionInfo(
            SessionManager.registerIdle
          ),
        };
      case ActionType.Stop:
        this.currentSession.end();
        this.saveSession();
        this.oldSession = this.currentSession;
        this.currentSession = new Session();
        this.currentAction = actionType;
        return {
          actionType: this.currentAction,
          sessionInfo: this.oldSession.getSessionInfo(
            SessionManager.registerIdle
          ),
        };
    }
  }
  getSessionInfo(): ISessionDataRow {
    if (
      this.oldSession !== undefined &&
      this.currentAction === ActionType.Stop
    ) {
      return {
        sessionInfo: this.oldSession.getSessionInfo(
          SessionManager.registerIdle
        ),
        actionType: this.currentAction,
      };
    }
    return {
      sessionInfo: this.currentSession.getSessionInfo(
        SessionManager.registerIdle
      ),
      actionType: this.currentAction,
    };
  }
  getCurrentlyManagedSessions(): ISessionDataRow[] {
    return [
      ...this.getManagedSessions(),
      {
        sessionInfo: this.currentSession.getSessionInfo(
          SessionManager.registerIdle
        ),
        actionType: this.currentAction,
      },
    ];
  }
  loadManagedSessions(sessions: ISessionDataRow[]): void {
    if (!sessions.every((x) => x.sessionInfo.durations.length !== 0)) {
      sessions = sessions.filter((x) => x.sessionInfo.durations.length !== 0);
    }
    if (
      sessions.length > 0 &&
      sessions[sessions.length - 1].actionType !== ActionType.Stop
    ) {
      const lastNotStoppedSession = sessions[sessions.length - 1];
      lastNotStoppedSession.actionType = ActionType.Stop;
    }
    this.managedSessions = sessions;
  }
  private getManagedSessions(): ISessionDataRow[] {
    return this.managedSessions;
  }
  private createNewSession(actionType: ActionType): void {
    if (
      actionType !== this.currentAction &&
      !this.currentSession.isNewSession() &&
      this.currentAction !== ActionType.Idle
    ) {
      this.saveSession();
      this.currentAction = actionType;
      this.currentSession.end();
      this.currentSession = new Session();
    }
    this.currentAction = actionType;
  }
  private saveSession(): void {
    this.managedSessions.push({
      sessionInfo: this.currentSession.getSessionInfo(
        SessionManager.registerIdle
      ),
      actionType: this.currentAction,
    });
  }
}
