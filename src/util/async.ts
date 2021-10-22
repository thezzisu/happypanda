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
