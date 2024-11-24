export class Lazy<T> {
  #value?: T;

  constructor(private readonly factory: () => T) {
    this.factory = factory;
  }

  get value(): T {
    if (!this.#value) {
      this.#value = this.factory();
    }

    return this.#value;
  }

  static of<T>(factory: () => T) {
    return new Lazy<T>(factory);
  }
}
