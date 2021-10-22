import { Adapter } from '../adapter'
import { Downloader } from './downloader'
import { GalleryCrawler } from './gallery'

export class Crawler {
  gallery: GalleryCrawler
  downloader: Downloader
  constructor(public adapter: Adapter) {
    this.gallery = new GalleryCrawler(this)
    this.downloader = new Downloader(this)
  }
}
