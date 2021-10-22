import { NodeAdapter } from './adapter'
import { Crawler } from './crawler'
import './preload'

async function main() {
  const crawler = new Crawler(new NodeAdapter())
  const gallery = await crawler.gallery.getGallery(
    'https://e-hentai.org/g/1991643/100fb249d9/'
  )
  console.log(gallery)
  await crawler.downloader.downloadGallery(gallery, '../temp')
}

main()
