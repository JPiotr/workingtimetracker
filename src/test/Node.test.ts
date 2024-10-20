import assert from "assert";
import { Node } from "../core/Node";

suite("Node", () => {
  test(`Root node should not link to preious node`, () => {
    const root: Node<string> = new Node("root");
    assert.equal(root.previous, null);
  });
  test(`Node should link to previous node`, () => {
    const root: Node<string> = new Node("root");
    const n2: Node<string> = new Node("n", root);
    assert.equal(n2.previous?.current, "root");
  });
});
