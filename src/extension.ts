import * as vscode from "vscode";
import {
  COMMAND_IDLE,
  COMMAND_SAVE,
  COMMAND_START,
  COMMAND_STOP,
} from "./config/Config";
import { ActionType } from "./core/ActionType";
import { interval, Subscription } from "rxjs";
import { SessionManager } from "./core/Sessions/SessionManager";
import { SessionState } from "./core/Sessions/SessionState";
import { convertTimeToString } from "./static/Utils";
import { DataStorageManager } from "./core/Data/DataStorageManager";
import { BehaviorDetector } from "./core/Behavior/BehaviorDetector";

let config = vscode.workspace.getConfiguration("workingtimetracker");
let ticks = interval(config.innerSessions.uiRefreshTime);
let autoSave = interval(config.innerSessions.autoSaveTime);
let idle = interval(config.innerSessions.idleTime);
let subscription = Subscription.EMPTY;
let autoSaveSubsciption = Subscription.EMPTY;
let idleSub = Subscription.EMPTY;
let statusBarItem: vscode.StatusBarItem;

const ICON_STARTED = "$(debug-start)";
const ICON_STOPPED = "$(debug-stop)";
const ICON_PAUSED = "$(debug-pause)";
let newly: boolean = true;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_START, () => {
      SessionManager.getInstance().menageSession(ActionType.Codding);
      newly = false;
    }),
    vscode.commands.registerCommand(COMMAND_STOP, () => {
      SessionManager.getInstance().menageSession(ActionType.Stop);
      newly = false;
    }),
    vscode.commands.registerCommand(COMMAND_IDLE, () => {
      SessionManager.getInstance().menageSession(ActionType.Idle);
      newly = false;
    }),
    vscode.commands.registerCommand(COMMAND_SAVE, () => {
      DataStorageManager.getInstance().saveData();
    }),
    vscode.workspace.onDidChangeConfiguration(() => {
      const newConfig = vscode.workspace.getConfiguration("workingtimetracker");
      if (
        config.innerSessions.uiRefreshTime !=
        newConfig.innerSessions.uiRefreshTime
      ) {
        subscription.unsubscribe();
        ticks = interval(newConfig.innerSessions.uiRefreshTime);
        subscription = ticks.subscribe(() => {
          updateStatusBarItem();
        });
      }
      if (
        config.innerSessions.autoSaveTime !=
        newConfig.innerSessions.autoSaveTime
      ) {
        autoSaveSubsciption.unsubscribe();
        autoSave = interval(newConfig.innerSessions.autoSaveTime);
        autoSaveSubsciption = autoSave.subscribe(() => {
          if (config.innerSessions.autoSave && !newly) {
            DataStorageManager.getInstance().saveData();
          }
        });
      }
      if (config.innerSessions.idleTime != newConfig.innerSessions.idleTime) {
        idleSub.unsubscribe();
        idle = interval(newConfig.innerSessions.idleTime);
        idleSub = idle.subscribe(() => {
          if (
            Date.now() - BehaviorDetector.getInstance().lastActive >
            config.innerSessions.idleTime
          ) {
            BehaviorDetector.getInstance().idleUser();
          }
        });
      }
      config = newConfig;
    }),
    ...BehaviorDetector.getInstance().detectCodding(),
    ...BehaviorDetector.getInstance().detectDebuging(),
    ...BehaviorDetector.getInstance().detectDocumenting(),
    ...BehaviorDetector.getInstance().detectBuilding(),
    ...BehaviorDetector.getInstance().detectIdle()
  );

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    500
  );
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  subscription = ticks.subscribe(() => {
    updateStatusBarItem();
  });
  idleSub = idle.subscribe(() => {
    if (
      Date.now() - BehaviorDetector.getInstance().lastActive >
      config.innerSessions.idleTime
    ) {
      BehaviorDetector.getInstance().idleUser();
    }
  });
  DataStorageManager.getInstance().loadData();
  autoSaveSubsciption = autoSave.subscribe(() => {
    if (config.innerSessions.autoSave && !newly) {
      DataStorageManager.getInstance().saveData();
    }
  });
  updateStatusBarItem();
}

function updateStatusBarItem(): void {
  if (BehaviorDetector.getInstance().isDetectedNewAction()) {
    newly = false;
  }
  if (newly) {
    statusBarItem.text = `${ICON_STOPPED} Not Started Time: ${convertTimeToString(
      0
    )}`;
    statusBarItem.command = COMMAND_START;
    return;
  }
  const sessionMenager = SessionManager.getInstance();
  const sessionDataRow = sessionMenager.getSessionInfo();

  const duration = sessionDataRow.sessionInfo.duration;
  const icon =
    sessionDataRow.sessionInfo.state === SessionState.Ongoing
      ? ICON_STARTED
      : sessionDataRow.sessionInfo.state === SessionState.Idle
      ? ICON_PAUSED
      : ICON_STOPPED;
  const action = getState(sessionDataRow.actionType);

  statusBarItem.text = `${icon} ${action} | Time: ${convertTimeToString(
    duration
  )}`;
  statusBarItem.command =
    sessionDataRow.sessionInfo.state === SessionState.Ongoing
      ? COMMAND_STOP
      : COMMAND_START;
}

function getState(state: ActionType): string | undefined {
  switch (state) {
    case ActionType.Idle:
      return "Idle       ";
    case ActionType.Codding:
      return "Codding    ";
    case ActionType.Debugging:
      return "Debugging  ";
    case ActionType.Documenting:
      return "Documenting";
    case ActionType.Testing:
      return "Testing    ";
    case ActionType.Stop:
      return "Stop       ";
    case ActionType.Building:
      return "Building   ";
    default:
      return "Undefined  ";
  }
}

export function deactivate() {
  SessionManager.getInstance().menageSession(ActionType.Stop);
  DataStorageManager.getInstance().saveData();
  subscription.unsubscribe();
  autoSaveSubsciption.unsubscribe();
  idleSub.unsubscribe();
}
