import { IGallery, IGalleryPage } from './gallery'
import type { Crawler } from './crawler'
import { createLogger } from '../util/logger'

const log = createLogger('downloader')

export class Downloader {
  constructor(public crawler: Crawler) {}

  async downloadPage(page: IGalleryPage, dist: string, original?: boolean) {
    const complete = await this.crawler.gallery.completePage(page)
    log(`Downloading ${page.url} to ${dist}`)
    if (original && !page.originalUrl) {
      log(`Orignial image for ${page.url} is not avaliable!`)
      original = false
    }
    await this.crawler.adapter.download(
      original ? complete.originalUrl : complete.imageUrl,
      dist
    )
  }

  async downloadGallery(gallery: IGallery, dist: string, original?: boolean) {
    log(`Downloading ${gallery.title} to ${dist}`)
    await this.crawler.adapter.write(
      JSON.stringify(gallery, null, '  '),
      dist + '/gallery.json'
    )
    for (const page of gallery.pages) {
      await this.downloadPage(page, dist + '/' + page.filename, original)
    }
  }
}
