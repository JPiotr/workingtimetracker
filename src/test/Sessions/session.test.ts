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
    // test(`Should return idle time`, () => {
    //   session.start();
    //   session.idle();
    //   setTimeout(() => {
    //     assert.equal(session.getSessionIdleDuration() >= 1000, 1000);
    //   }, 1000);
    // });
    test(`Should contains 3 durations`, () => {
      session.start();
      session.idle();
      session.start();
      session.end();
      assert.equal(session.getSessionInfo().durations.length, 5);
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
    test(`Session started`, () => {
      assert.equal(session.sessionState, SessionState.Ongoing);
    });
    test(`Session is idle`, () => {
      session.idle();
      assert.equal(session.sessionState, SessionState.Idle);
    });
    test(`Session ended`, () => {
      session.end();
      assert.equal(session.sessionState, SessionState.Ended);
    });
  });
});
