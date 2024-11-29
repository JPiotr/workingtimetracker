import { Node } from "../Node";
import { ISessionDurationInfo } from "./ISessionDurationInfo";
import { ISessionInfo } from "./ISessionInfo";
import { SessionDuration } from "./SessionDuration";
import { SessionState } from "./SessionState";

export class Session {
  private _id: string;
  private _newSession: boolean;
  private _sessionsChain!: Node<SessionDuration>;
  sessionState: SessionState = SessionState.Idle;
  private _filesExt : string[] = [];

  constructor() {
    this._id = crypto.randomUUID();
    this._newSession = true;
  }

  start(): void {
    if(!this._newSession && this.sessionState === SessionState.Idle){
      this._sessionsChain.current.end();
    }
    if (this.sessionState !== SessionState.Ongoing) {
      this.sessionState = SessionState.Ongoing;
      this.createNewSessionDuration(this.sessionState);
      this._newSession = false;
    }
  }

  idle(): void {
    if (this.sessionState === SessionState.Ongoing && !this._newSession) {
      this._sessionsChain.current.end();
      this.sessionState = SessionState.Idle;
      this.createNewSessionDuration(this.sessionState);
    }
  }

  end(): void {
    if (this.sessionState !== SessionState.Ended && !this._newSession) {
      this._sessionsChain.current.end();
      this.sessionState = SessionState.Ended;
    }
  }

  private createNewSessionDuration(state: SessionState): void {
    const session = new SessionDuration();
    session.start(state);
    this._sessionsChain = this._newSession
      ? new Node<SessionDuration>(session)
      : new Node<SessionDuration>(session, this._sessionsChain);
  }

  getSessionDuration(): number[] {
    let node: Node<SessionDuration> = this._sessionsChain;
    const durations = [0, 0];

    if (node === undefined) {
      return durations;
    }
    const currentDuration = node.current.getCurrentDuration();
    switch (this.sessionState) {
      case SessionState.Ongoing:
        durations[0] = currentDuration;
        durations[1] += currentDuration;
        break;
      case SessionState.Idle:
        durations[1] += currentDuration;
        break;
      case SessionState.Ended:
        break;
    }

    while (node.previous !== null) {
      node = node.previous;
      const nodeDuration = node.current.getDuration();
      if (node.current.getInfo().state === SessionState.Idle) {
        durations[1] += nodeDuration;
        continue;
      }
      durations[0] += nodeDuration;
      durations[1] += nodeDuration;
    }
    return durations;
  }

  getSessionInfo(): ISessionInfo {
    const durations: ISessionDurationInfo[] = [];
    let node: Node<SessionDuration> = this._sessionsChain;
    if (!this._newSession) {
      durations.push(node.current.getInfo());
      while (node.previous !== null) {
        node = node.previous;
        durations.push(node.current.getInfo());
      }
    }
    const duration = this.getSessionDuration();
    return {
      id: this._id,
      duration: duration[0],
      idle: duration[1],
      state: this.sessionState,
      durations: durations,
      filesExt: this._filesExt
    };
  }

  isNewSession(): boolean {
    return this._newSession;
  }

  addNewFileExtInfo(ext: string){
    if(!this._filesExt.includes(ext)){
      this._filesExt.push(ext);
    }
  }
}
