
export class Node<T> {

    current: T;
    previous: Node<T> | null;

    constructor(current: T, previous: Node<T> | null = null) {
        this.previous = previous;
        this.current = current;
    }

    public getFirst(): T {
        let node: Node<T> = this;
        while (node.previous !== null) {
            node = node.previous;
        }
        return node.current;
    }
}
