export type LazyValueOf<L> = L extends Lazy<infer T> ? T : never;

export type LazyAsyncValueOf<L> = L extends LazyAsync<infer T> ? T : never;

export class Lazy<T> {
  readonly #fn: () => T;
  #value: T | undefined;

  constructor(fn: () => T) {
    this.#fn = fn;
  }

  get value(): T {
    if (this.#value === undefined) {
      this.#value = this.#fn();
    }

    return this.#value;
  }
}

export function lazify<T>(fn: () => T) {
  const lazy = new Lazy(fn);
  return () => lazy.value;
}

export class LazyAsync<T> {
  readonly #fn: () => Promise<T>;
  #value: T | undefined;
  #promise: Promise<T> | undefined;

  constructor(fn: () => Promise<T>) {
    this.#fn = fn;
  }

  get value(): T {
    if (this.#value === undefined) {
      throw new TypeError("Lazy async value is not initialized yet");
    }

    return this.#value;
  }

  getValue(): Promise<T> {
    if (this.#promise === undefined) {
      this.#promise = (async () => {
        try {
          this.#value = await this.#fn();
          return this.#value;
        } catch (error) {
          this.#promise = undefined;
          throw error;
        }
      })();
    }

    return this.#promise;
  }
}

export function lazifyAsync<T>(fn: () => Promise<T>) {
  const lazy = new LazyAsync(fn);
  return () => lazy.getValue();
}
