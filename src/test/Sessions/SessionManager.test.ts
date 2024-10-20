import assert from "assert";
import { SessionManager } from "../../core/Sessions/SessionManager";

suite(`SessionManager`,()=>{
    test(`Should return instance`, ()=>{
        assert.notEqual(SessionManager.getInstance(), undefined);
    });
});