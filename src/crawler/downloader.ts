import { IGallery, IGalleryPage } from './gallery'
import type { Crawler } from './crawler'
import { createLogger } from '../util/logger'

const log = createLogger('downloader')

export class Downloader {
  constructor(public crawler: Crawler) {}

  async downloadPage(page: IGalleryPage, dist: string, origin?: boolean) {
    log(`Downloading ${page.url} to ${dist}`)
    await this.crawler.adapter.download(
      origin ? page.originalUrl : page.imageUrl,
      dist
    )
  }

  async downloadGallery(gallery: IGallery, dist: string, origin?: boolean) {
    log(`Downloading ${gallery.title} to ${dist}`)
    for (const page of gallery.pages) {
      await this.downloadPage(page, dist + '/' + page.filename, origin)
    }
  }
}
