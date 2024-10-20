export class Node<T> {
  current: T;
  previous: Node<T> | null;

  constructor(current: T, previous: Node<T> | null = null) {
    this.previous = previous;
    this.current = current;
  }
}
