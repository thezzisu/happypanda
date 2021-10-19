import got from 'got'
import ProxyAgent from 'proxy-agent'
import { promisify } from 'util'
import * as stream from 'stream'
import { createWriteStream } from 'fs'
const pipeline = promisify(stream.pipeline)

export const agent = new ProxyAgent()

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'

const Cookie = process.env.EH_COOKIE

export const http = got.extend({
  agent: { http: agent, https: agent, http2: agent },
  headers: {
    'User-Agent': UA,
    Cookie
  }
})

export async function download(url: string, dist: string) {
  console.log(`Downloading ${url} to ${dist}`)
  const downloadStream = http.stream(url)
  const writeStream = createWriteStream(dist)
  await pipeline(downloadStream, writeStream)
}
