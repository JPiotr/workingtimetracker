import assert from "assert";
import { SessionDuration } from "../../core/Sessions/SessionDuration";

let duration : SessionDuration;
suiteSetup('Tests Setup',()=>{
    duration = new SessionDuration();
    duration.start();
});
suite('Session Duration Tests', ()=>{
    test('Duration not ended',()=>{
        assert.strictEqual(duration.getDuration(),0);
    });
    test('Duration ended', ()=>{
        setTimeout(()=>{
            duration.end();
            assert.strictEqual(duration.getDuration() > 1000, true );
        },1000);
    });
});
