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
  test(`Should not register duration before end`, ()=>{
    assert.equal(duration.getDuration(),0);
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
  test(`Should return all information`, ()=>{
    setTimeout(()=>{
      duration.end();
      const info = duration.getInfo();
      assert.notEqual(info, undefined);
      assert.notEqual(info, null);
      assert.notEqual(info.id,"");
      assert.equal(info.duration > 1000, true);
      assert.equal(info.state, SessionState.Ongoing);
      assert.equal(info.begin > info.end, true);
    },1000);
  })
});
