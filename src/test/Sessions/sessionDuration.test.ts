import assert from "assert";
import { SessionDuration } from "../../core/Sessions/SessionDuration";
import { SessionState } from "../../core/Sessions/SessionState";
import { beforeEach } from "mocha";

suite(`SessionDuration`, () => {
  let duration: SessionDuration;
  beforeEach(() => {
    duration = new SessionDuration();
    duration.start(SessionState.Ongoing);
  });
  test(`Should duration start`, () => {
    assert.equal(duration.getInfo().id !== undefined, true);
    duration.end();
  });
  test(`Should duration end`, () => {
    setTimeout(() => {
      duration.end();
      assert.equal(duration.getDuration() > 1000, true);
    }, 1000);
  });
  test(`Should return current duration`, () => {
    setTimeout(() => {
      assert.equal(duration.getCurrentDuration() < 1000, true);
      duration.end();
    }, 1000);
  });
  test(`Should register duration state`, () => {
    duration.end();
    assert.equal(duration.getInfo().state, SessionState.Ongoing);
  });
});
