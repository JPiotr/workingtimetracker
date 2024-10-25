import assert from "assert";
import { Session } from "../../core/Sessions/Session";
import { SessionState } from "../../core/Sessions/SessionState";
import { afterEach, beforeEach } from "mocha";

suite(`Session`, () => {
  test(`Should create new session`, () => {
    const session: Session = new Session();
    assert.equal(session.isNewSession(), true);
  });
  suite(`Session durations`, () => {
    const session: Session = new Session();
    test(`Should contains 3 durations`, () => {
      session.start(); //first
      session.idle(); //second
      session.start(); //third
      session.end();
      assert.equal(session.getSessionInfo().durations.length, 3);
    });
    test(`Should return idle time`, async () => {
      session.start();
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      const duration = session.getSessionDuration()[1];
      session.idle();
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      const idle = session.getSessionDuration()[1];
      assert.equal(duration >= 500 && duration < idle, true);
      assert.equal(idle >= 1000, true);
    });
    test(`Should return not idle time`, async () => {
      session.start();
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      assert.equal(session.getSessionDuration()[1] >= 1000, true);
    });
  });
  suite(`Session processes`, () => {
    const session: Session = new Session();
    afterEach(() => {
      session.end();
    });
    beforeEach(() => {
      session.start();
    });
    test(`Session should start`, () => {
      assert.equal(session.sessionState, SessionState.Ongoing);
    });
    test(`Session should be idle`, () => {
      session.idle();
      assert.equal(session.sessionState, SessionState.Idle);
    });
    test(`Session should ended`, () => {
      session.end();
      assert.equal(session.sessionState, SessionState.Ended);
    });
    test(`Session should return all data`, async () => {
      session.idle();
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      const info = session.getSessionInfo();
      assert.equal(info.duration > 0, true);
      assert.equal(info.idle > 0, true);
      assert.equal(info.duration !== info.idle, true);
      assert.equal(info.state, SessionState.Idle);
      assert.equal(info.id != "", true);
    });
  });
});
