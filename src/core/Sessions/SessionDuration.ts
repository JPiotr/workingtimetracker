import { ISessionDurationInfo } from "./ISessionDurationInfo";
import { SessionState } from "./SessionState";

export class SessionDuration {
  private _id!: string;
  private _state!: SessionState;
  private _begin!: number;
  private _end!: number;
  private _duration: number = 0;

  public start(state: SessionState): void {
    this._state = state;
    this._id = crypto.randomUUID();
    this._begin = Date.now();
    this._end = this._begin;
  }

  public end(): void {
    this._end = Date.now();
    this._duration = this._end - this._begin;
  }

  public getDuration(): number {
    return this._duration;
  }

  public getCurrentDuration(): number {
    return this._duration !== 0 ? 
      this._duration : 
      Date.now() - this._begin;
  }

  public getInfo(): ISessionDurationInfo {
    return {
      id: this._id,
      state : this._state,
      begin: this._begin,
      end: this._end,
      duration: this._duration,
    };
  }
}
