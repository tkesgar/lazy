type Fn<T> = () => T;

/**
 * Wraps a function `fn` to be executed lazily:
 *
 * - `fn` will never be called until `.value` is accessed
 * - Once `fn` is called and returns a value, the value is saved and `fn` will
 *   never be called anymore.
 *
 * `fn` will be called again if `fn` returns `undefined` or throws an error.
 *
 * Note that `Lazy` does not work well with asynchronous functions (functions
 * that return `Promise` objects), since the resulting promise may be rejected.
 * Use `LazyAsync` to work with asynchronous functions.
 */
export class Lazy<T> {
  readonly #fn: Fn<T>;
  #value: T | undefined;

  constructor(fn: Fn<T>) {
    this.#fn = fn;
  }

  /**
   * Returns `fn()` or the saved value.
   */
  get value(): T {
    if (this.#value === undefined) {
      this.#value = this.#fn();
    }

    return this.#value;
  }
}

/**
 * Retrieves the value type of a `Lazy`.
 *
 * ```ts
 * const myLazy = new Lazy(() => 'foo')
 * type MyLazy = LazyValueOf<typeof myLazy> // string
 * ```
 */
export type LazyValueOf<L> = L extends Lazy<infer T> ? T : never;

/**
 * Returns a lazy version of `fn`.
 *
 * @see {Lazy}
 * @param fn Function to be wrapped
 * @returns The lazy version of `fn`
 */
export function lazify<T>(fn: Fn<T>): Fn<T> {
  const lazy = new Lazy(fn);
  return () => lazy.value;
}

/**
 * Wraps an asynchronous function `asyncFn` (function that returns a `Promise`)
 * to be executed lazily:
 *
 * - `asyncFn` will never be called until `.getValue()` is called
 * - Once `asyncFn` is called and resolves to a value, the value is saved and
 * `asyncFn` will never be called anymore.
 *
 * `asyncFn` will be called again if `asyncFn` resolves to `undefined` or
 * rejects with an error.
 */
export class LazyAsync<T> {
  readonly #fn: Fn<Promise<T>>;
  #value: T | undefined;
  #promise: Promise<T> | undefined;

  constructor(asyncFn: Fn<Promise<T>>) {
    this.#fn = asyncFn;
  }

  /**
   * Returns the saved value.
   *
   * If `getValue()` is never called before, accessing `.value` throws an
   * error.
   */
  get value(): T {
    if (this.#value === undefined) {
      throw new TypeError("Lazy async value is not initialized yet");
    }

    return this.#value;
  }

  /**
   * Resolves to `fn()`.
   *
   * @returns
   */
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

/**
 * Retrieves the value type of a `LazyAsync`.
 *
 * ```ts
 * const myLazy = new LazyAsync(async () => 'foo')
 * type MyLazy = LazyAsyncValueOf<typeof myLazy> // string
 * ```
 */
export type LazyAsyncValueOf<L> = L extends LazyAsync<infer T> ? T : never;

/**
 * Returns a lazy version of `asyncFn`.
 *
 * @see {LazyAsync}
 * @param asyncFn Async function to be wrapped
 * @returns The lazy version of `asyncFn`
 */
export function lazifyAsync<T>(asyncFn: Fn<Promise<T>>): Fn<Promise<T>> {
  const lazy = new LazyAsync(asyncFn);
  return () => lazy.getValue();
}
