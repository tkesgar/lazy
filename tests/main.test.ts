import { describe, expect, it, vi } from "vitest";
import { Lazy, LazyAsync } from "../src/main";

describe.concurrent("Lazy", () => {
  it("should not call fn initially", () => {
    const fn = vi.fn(() => "foo");

    new Lazy(fn);

    expect(fn).not.toBeCalled();
  });

  it("should call fn when value is get", () => {
    const fn = vi.fn(() => "foo");

    const lazy = new Lazy(fn);

    expect(lazy.value).toBe("foo");

    expect(fn).toBeCalledTimes(1);
  });

  it("should only call fn once when value is get multiple times", () => {
    const fn = vi.fn(() => "foo");

    const lazy = new Lazy(fn);

    expect(lazy.value).toBe("foo");
    expect(lazy.value).toBe("foo");
    expect(lazy.value).toBe("foo");

    expect(fn).toBeCalledTimes(1);
  });

  it("should throw error when fn throws error", () => {
    const fn = vi.fn(() => {
      throw new Error("Oh noes!");
    });

    const lazy = new Lazy(fn);

    expect(() => lazy.value).toThrowError("Oh noes!");

    expect(fn).toBeCalledTimes(1);
  });

  it("should call fn multiple times and throw error multiple times when fn throws error", () => {
    const fn = vi.fn(() => {
      throw new Error("Oh noes!");
    });

    const lazy = new Lazy(fn);

    expect(() => lazy.value).toThrowError("Oh noes!");
    expect(() => lazy.value).toThrowError("Oh noes!");
    expect(() => lazy.value).toThrowError("Oh noes!");

    expect(fn).toBeCalledTimes(3);
  });
});

describe.concurrent("LazyAsync", () => {
  it("should not call fn initially", () => {
    const fn = vi.fn(async () => "foo");

    new LazyAsync(fn);

    expect(fn).not.toBeCalled();
  });

  it("should call fn when value is get", async () => {
    const fn = vi.fn(async () => "foo");

    const lazy = new LazyAsync(fn);

    expect(await lazy.getValue()).toBe("foo");

    expect(fn).toBeCalledTimes(1);
  });

  it("should only call fn once when value is get multiple times", async () => {
    const fn = vi.fn(async () => "foo");

    const lazy = new LazyAsync(fn);

    expect(await lazy.getValue()).toBe("foo");
    expect(await lazy.getValue()).toBe("foo");
    expect(await lazy.getValue()).toBe("foo");

    expect(fn).toBeCalledTimes(1);
  });

  it("should only call fn once when value is get multiple times synchronously", async () => {
    const fn = vi.fn(async () => "foo");

    const lazy = new LazyAsync(fn);

    expect(
      await Promise.all([
        lazy.getValue(),
        lazy.getValue(),
        lazy.getValue(),
        lazy.getValue(),
      ])
    ).toEqual(["foo", "foo", "foo", "foo"]);

    expect(fn).toBeCalledTimes(1);
  });

  it("should throw error when fn throws error", async () => {
    const fn = vi.fn(async () => {
      throw new Error("Oh noes!");
    });

    const lazy = new LazyAsync(fn);

    await expect(lazy.getValue()).rejects.toThrowError("Oh noes!");

    expect(fn).toBeCalledTimes(1);
  });

  it("should call fn multiple times and throw error when fn throws error and getValue() is called", async () => {
    const fn = vi.fn(async () => {
      throw new Error("Oh noes!");
    });

    const lazy = new LazyAsync(fn);

    await expect(lazy.getValue()).rejects.toThrowError("Oh noes!");
    await expect(lazy.getValue()).rejects.toThrowError("Oh noes!");
    await expect(lazy.getValue()).rejects.toThrowError("Oh noes!");

    expect(fn).toBeCalledTimes(3);
  });

  it("should call fn once and throw error when fn throws error and getValue() is called synchronously", async () => {
    const fn = vi.fn(async () => {
      throw new Error("Oh noes!");
    });

    const lazy = new LazyAsync(fn);

    await expect(
      Promise.all([
        lazy.getValue(),
        lazy.getValue(),
        lazy.getValue(),
        lazy.getValue(),
      ])
    ).rejects.toThrowError("Oh noes!");

    expect(fn).toBeCalledTimes(1);
  });

  it("should return value if .value is get and value has been initialized", async () => {
    const fn = vi.fn(async () => "bar");

    const lazy = new LazyAsync(fn);

    await lazy.getValue();
    await lazy.getValue();
    await lazy.getValue();

    expect(lazy.value).toBe("bar");
    expect(lazy.value).toBe("bar");
    expect(lazy.value).toBe("bar");

    expect(fn).toBeCalledTimes(1);
  });

  it("should throw error if .value is get and value has not been initialized", () => {
    const fn = vi.fn(async () => "bar");

    const lazy = new LazyAsync(fn);

    expect(() => lazy.value).toThrowError(
      "Lazy async value is not initialized yet"
    );

    expect(fn).not.toBeCalled();
  });
});
