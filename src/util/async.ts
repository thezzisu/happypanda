export function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500
): Promise<T> {
  let lasterr
  while (retries--) {
    try {
      return await fn()
    } catch (err) {
      lasterr = err
    }
    await wait(delay)
  }
  throw lasterr
}

export class AsyncQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #last: Promise<any> = Promise.resolve()

  async exec<T>(factory: () => Promise<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (this.#last = this.#last.catch(() => {}).then(factory))
  }
}

const queue = new AsyncQueue()

export async function queued<T>(factory: () => Promise<T>): Promise<T> {
  return queue.exec(factory)
}
