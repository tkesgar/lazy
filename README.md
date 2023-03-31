# lazy

> Run a function lazily

## Installation

```
$ npm install @tkesgar/lazy
```

## Usage

```ts
function doSomething() {
  process.nextTick(() => {
    console.log('yo')
  })

  return Math.random()
}

const myLazy = new Lazy(doSomething)
console.log(myLazy.value)
console.log(myLazy.value)
console.log(myLazy.value)
// 0.7474503288311625
// 0.7474503288311625
// 0.7474503288311625
// yo

async function doSomethingAsync() {
  await new Promise(resolve => process.nextTick(() => {
    console.log('yo')
    resolve()
  })))

  return Math.random()
}

const myLazyAsync = new LazyAsync(doSomethingAsync)
console.log(await myLazyAsync.getValue())
console.log(await myLazyAsync.getValue())
console.log(await myLazyAsync.getValue())
// yo
// 0.22380571408704864
// 0.22380571408704864
// 0.22380571408704864

console.log(myLazyAsync.value)
// 0.22380571408704864

const lazyDoSomething = lazify(doSomething)
lazyDoSomething()
lazyDoSomething()
lazyDoSomething()
// 0.43478154082214004
// yo
// 0.43478154082214004
// 0.43478154082214004

const lazyDoSomethingAsync = lazifyAsync(doSomethingAsync)
await lazyDoSomethingAsync()
await lazyDoSomethingAsync()
await lazyDoSomethingAsync()
// yo
// 0.5468407710930714
// 0.5468407710930714
// 0.5468407710930714
```

## Recipes

### Lazy initialization

```ts
// database.ts

export const db = knex({
    client: "postgres",
    connection: getConnectionConfig(),
  })
)
```

A database connection will always be created, even if it is not used.

```ts
// database.ts

const _db = new Lazy(() =>
  knex({
    client: "postgres",
    connection: getConnectionConfig(),
  })
);

export function db(): LazyValueOf<typeof _db> {
  return _db.value;
}
```

The database connection will never be created if the script does not call
`db()`.

## License

Licensed under [MIT License](./LICENSE).
