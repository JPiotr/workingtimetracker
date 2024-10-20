import { Node } from "../Node";
import { ISessionDurationInfo } from "./ISessionDurationInfo";
import { ISessionInfo } from "./ISessionInfo";
import { SessionDuration } from "./SessionDuration";
import { SessionState } from "./SessionState";

export class Session {
  private _sessionsChain!: Node<SessionDuration>;
  private _id: string;
  private _newSession: boolean;
  private _idleTime = 0;
  sessionState: SessionState = SessionState.Idle;

  constructor() {
    this._id = crypto.randomUUID();
    this._newSession = true;
  }

  start(): void {
    if (this.sessionState !== SessionState.Ongoing) {
      this.saveIdleTime();
      this.createNewSessionDuration();
      this.sessionState = SessionState.Ongoing;
      this._newSession = false;
    }
  }

  idle(): void {
    if (this.sessionState === SessionState.Ongoing && !this._newSession) {
      this._sessionsChain.current.end();
      this.createNewSessionDuration();
      this.sessionState = SessionState.Idle;
    }
  }

  end(): void {
    this.saveIdleTime();
    if (this.sessionState !== SessionState.Ended && !this._newSession) {
      this._sessionsChain.current.end();
      this.sessionState = SessionState.Ended;
    }
  }

  private createNewSessionDuration(): void {
    const session = new SessionDuration();
    session.start();
    this._sessionsChain = this._newSession
      ? new Node<SessionDuration>(session)
      : new Node<SessionDuration>(session, this._sessionsChain);
  }

  private saveIdleTime(): void {
    if (this.sessionState === SessionState.Idle && !this._newSession) {
      this._idleTime += this._sessionsChain.current.getCurrentDuration();
    }
  }

  //it should get the sumarize session duration time.
  getSessionDuration(withIdle: boolean): number {
    let node: Node<SessionDuration> = this._sessionsChain;
    let duration = 0;

    if (node === undefined) {
      return duration;
    }

    switch (this.sessionState) {
      case SessionState.Ongoing:
        duration = node.current.getCurrentDuration();
        break;
      case SessionState.Idle:
        duration += withIdle ? node.current.getCurrentDuration() : 0;
        break;
      case SessionState.Ended:
        break;
    }

    while (node.previous !== null) {
      node = node.previous;
      duration += node.current.getDuration();
    }
    return withIdle ? duration + this._idleTime : duration;
  }

  getSessionIdleDuration(): number {
    return this._idleTime;
  }

  getSessionInfo(withIdle: boolean): ISessionInfo {
    const durations: ISessionDurationInfo[] = [];
    let node: Node<SessionDuration> = this._sessionsChain;
    if (!this._newSession) {
      durations.push(node.current.getInfo());
      while (node.previous !== null) {
        node = node.previous;
        durations.push(node.current.getInfo());
      }
    }
    return {
      id: this._id,
      duration: this.getSessionDuration(withIdle),
      state: this.sessionState,
      durations: durations,
    };
  }

  isNewSession(): boolean {
    return this._newSession;
  }
}
