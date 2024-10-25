import * as vscode from "vscode";
import { ActionType } from "../ActionType";
import { SessionManager } from "../Sessions/SessionManager";
import { IBehaviorDetector } from "./IBehaviorDetector";
import { DataStorageManager } from "../Data/DataStorageManager";

export class BehaviorDetector implements IBehaviorDetector {
  public lastActive: number = 0;
  private sessionMenager: SessionManager = SessionManager.getInstance();
  private lastDetectedAction: ActionType = ActionType.Stop;
  private currentAction: ActionType = ActionType.Idle;
  private state: boolean = true;
  private static instance: BehaviorDetector;
  private isIdle: boolean = false;
  private config!: vscode.WorkspaceConfiguration;

  private constructor() {}

  static getInstance() {
    if (this.instance === undefined) {
      this.instance = new BehaviorDetector();
    }
    this.instance.config =
      vscode.workspace.getConfiguration("workingtimetracker");
    return this.instance;
  }

  isDetectedNewAction(): boolean {
    return this.currentAction !== this.lastDetectedAction;
  }
  detectIdle(): vscode.Disposable[] {
    return [
      vscode.debug.onDidTerminateDebugSession(() => {
        this.setNewAction(ActionType.Idle);
      }),
      vscode.tasks.onDidEndTask(() => {
        this.setNewAction(ActionType.Idle);
      }),
      vscode.tasks.onDidEndTaskProcess(() => {
        this.setNewAction(ActionType.Idle);
      }),
      vscode.window.onDidChangeWindowState((e) => {
        if (e.focused) {
          this.isIdle = false;
        } else {
          this.isIdle = true;
          this.lastDetectedAction = this.currentAction;
          this.currentAction = ActionType.Idle;
        }
        this.invokeManager();
      }),
      vscode.window.onDidChangeActiveTextEditor((e) => {
        this.updateConfig();
        if (this.getFileName(e).toLowerCase().includes(this.config.fileName)) {
          this.setNewAction(ActionType.Idle);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.updateConfig();
        if (this.getFileName(e.textEditor).toLowerCase().includes(this.config.fileName)) {
          this.setNewAction(ActionType.Idle);
        }
      }),
    ];
  }
  detectCodding(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        this.updateConfig();
        if (
          !this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            this.getFileName(e).includes(x)
          ) &&
          !this.getFileName(e).toLowerCase().includes("test") &&
          !this.getFileName(e).toLowerCase().includes(this.config.fileName)
        ) {
          this.setNewAction(ActionType.Codding);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.updateConfig();
        if (
          !this.getFileName(e.textEditor)
            .toLowerCase()
            .includes(this.config.fileName) &&
          !this.getFileName(e.textEditor).includes("test") &&
          !this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            this.getFileName(e.textEditor).includes(x)
          )
        ) {
          this.setNewAction(ActionType.Codding);
        }
      }),
    ];
  }
  detectDebuging(): vscode.Disposable[] {
    return [
      vscode.debug.onDidStartDebugSession(() => {
        this.setNewAction(ActionType.Debugging);
      }),
      vscode.debug.onDidChangeActiveDebugSession(() => {
        this.setNewAction(ActionType.Debugging);
      }),
      vscode.debug.onDidChangeBreakpoints(() => {
        this.setNewAction(ActionType.Debugging);
      }),
    ];
  }
  detectDocumenting(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        this.updateConfig();
        if (
          !this.getFileName(e).toLowerCase().includes(this.config.fileName) &&
          !this.getFileName(e).toLowerCase().includes("test") &&
          this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            this.getFileName(e).includes(x)
          )
        ) {
          this.setNewAction(ActionType.Documenting);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.updateConfig();
        if (
          !this.getFileName(e.textEditor).toLowerCase().includes(this.config.fileName) &&
          !this.getFileName(e.textEditor).toLowerCase().includes("test") &&
          this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            this.getFileName(e.textEditor).includes(x)
          )
        ) {
          this.setNewAction(ActionType.Documenting);
        }
      }),
    ];
  }
  detectTesting(): vscode.Disposable[] {
    return [
      vscode.tasks.onDidStartTask((task) => {
        if (task.execution.task.name.toLowerCase().includes("test")) {
          this.setNewAction(ActionType.Testing);
        }
      }),
      vscode.tasks.onDidStartTaskProcess((task) => {
        if (task.execution.task.name.toLowerCase().includes("test")) {
          this.setNewAction(ActionType.Testing);
        }
      }),
      vscode.window.onDidChangeActiveTextEditor((e) => {
        this.updateConfig();
        if (
          this.config.behaviorDetector.detectTestingWhileEditingTestFile &&
          this.getFileName(e).toLowerCase().includes("test")
        ) {
          this.setNewAction(ActionType.Testing);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.updateConfig();
        if (
          this.config.behaviorDetector.detectTestingWhileEditingTestFile &&
          this.getFileName(e.textEditor).includes("test")
        ) {
          this.setNewAction(ActionType.Testing);
        }
      }),
    ];
  }
  detectBuilding(): vscode.Disposable[] {
    return [
      vscode.tasks.onDidStartTask(() => {
        this.setNewAction(ActionType.Building);
      }),
      vscode.tasks.onDidStartTaskProcess(() => {
        this.setNewAction(ActionType.Building);
      }),
    ];
  }
  detectWorkspaceChanged(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e !== undefined) {
          const newUri = vscode.Uri.parse(e?.document.uri.path);
          if (DataStorageManager.currentWorkspace !== newUri) {
            DataStorageManager.currentWorkspace = newUri;
          }
        }
      }),
    ];
  }
  private getFileName(textEditor: vscode.TextEditor | undefined): string {
    const fileName = textEditor?.document.fileName;
    return fileName === undefined ? "" : fileName.toLowerCase();
  }
  idleUser() {
    if (this.currentAction !== ActionType.Idle && this.state) {
      this.lastDetectedAction = this.currentAction;
      this.currentAction = ActionType.Idle;
      this.isIdle = true;
    }
    this.invokeManager();
  }
  private setNewAction(action: ActionType) {
    if (this.currentAction !== action && this.state) {
      this.lastActive = Date.now();
      this.lastDetectedAction = this.currentAction;
      this.currentAction = action;
      this.isIdle = false;
      this.invokeManager();
    }
  }
  private invokeManager(): void {
    if (this.isDetectedNewAction()) {
      this.sessionMenager.menageSession(this.currentAction);
    }
  }
  private updateConfig(): void {
    this.config = vscode.workspace.getConfiguration("workingtimetracker");
  }
}
