export abstract class Adapter {
  abstract get(url: string): Promise<string>

  abstract download(url: string, dist: string): Promise<void>
  abstract write(content: string, dist: string): Promise<void>
}
