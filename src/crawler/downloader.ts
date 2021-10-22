import { IGallery, IGalleryPage } from './gallery'
import type { Crawler } from './crawler'
import { createLogger } from '../util/logger'
import { retry } from '../util/async'

const log = createLogger('downloader')

export class Downloader {
  constructor(public crawler: Crawler) {}

  async downloadPage(page: IGalleryPage, dist: string, original?: boolean) {
    log(`Downloading ${page.url} to ${dist}`)
    if (original && !page.originalUrl) {
      log(`Orignial image for ${page.url} is not avaliable!`)
      original = false
    }
    await retry(() =>
      this.crawler.adapter.download(
        original ? page.originalUrl : page.imageUrl,
        dist
      )
    )
  }

  async downloadGallery(gallery: IGallery, dist: string, original?: boolean) {
    log(`Downloading ${gallery.title} to ${dist}`)
    for (const page of gallery.pages) {
      await this.downloadPage(page, dist + '/' + page.filename, original)
    }
    await this.crawler.adapter.write(
      JSON.stringify(gallery, null, '  '),
      dist + '/gallery.json'
    )
  }
}
