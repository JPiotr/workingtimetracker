import * as assert from 'assert';

suite('Extension Smoke Tests', () => {

	test("Smoke Test", () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});