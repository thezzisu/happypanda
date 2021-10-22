import cheerio, { CheerioAPI } from 'cheerio'
import { URL } from 'url'
import { createLogger } from '../util/logger'
import type { Crawler } from './crawler'

const log = createLogger('gallery')

export interface IGalleryPage {
  url: string
  thumbnailUrl: string
  filename: string
  imageUrl: string
  originalUrl: string
}

export interface IGallery {
  url: string
  thumbnailUrl: string
  title: string
  titleJpn: string
  pages: IGalleryPage[]
  tags: string[]
}

export class GalleryCrawler {
  constructor(public crawler: Crawler) {}

  private extractTitle($: CheerioAPI) {
    return [$('#gn').text(), $('#gj').text()] as const
  }

  private extractThumbnail($: CheerioAPI) {
    return $('#gd1')
      .children()
      .first()
      .css('background')!
      .match(/url\((.*)\)/)![1]
  }

  private extractPaginationCount($: CheerioAPI) {
    return $('.gtb')
      .first()
      .find('table > tbody > tr > td > a')
      .get()
      .map((elem) => $(elem).attr('href'))
      .filter((href) => href)
      .map((href) => new URL(href!).searchParams.get('p'))
      .filter((p) => p)
      .map((p) => +p!)
      .reduce((acc, cur) => Math.max(acc, cur), 0)
  }

  private extractPages($: CheerioAPI) {
    return $('#gdt > div')
      .get()
      .map((elem) => ({
        url: $(elem).find('a').attr('href')!,
        thumbnailUrl: $(elem).find('img').attr('src')!
      }))
      .filter((value) => value.url)
  }

  private extractTags($: CheerioAPI) {
    return $('#taglist > table > tbody > tr')
      .get()
      .map((elem) => $(elem).children().get())
      .map(
        ([first, second]) =>
          [
            $(first).text(),
            $(second)
              .children()
              .get()
              .map((elem) => $(elem).text())
          ] as const
      )
      .map(([prefix, tags]) => tags.map((tag) => `${prefix}${tag}`))
      .reduce((acc, cur) => acc.concat(cur), [])
  }

  private async getPage(galleryPageUrl: string) {
    const body = await this.crawler.adapter.get(galleryPageUrl)
    const $ = cheerio.load(body)
    const filename = $('#i2').children().last().text().split('::')[0].trim()
    const imageUrl = $('#i3').children().children().first().attr('src')!
    const originalUrl = $('#i7').children('a').attr('href')!
    return {
      filename,
      imageUrl,
      originalUrl
    }
  }

  private async getPages($: CheerioAPI) {
    log(`Total pages = ${this.extractPages($).length}`)
    return Promise.all(
      this.extractPages($).map(async (value) => ({
        ...value,
        ...(await this.getPage(value.url))
      }))
    )
  }

  async getGallery(galleryUrl: string): Promise<IGallery> {
    const body = await this.crawler.adapter.get(galleryUrl)
    const $ = cheerio.load(body)
    const [title, titleJpn] = this.extractTitle($)
    const thumbnailUrl = this.extractThumbnail($)

    const count = this.extractPaginationCount($)
    const pages = await this.getPages($)
    for (let i = 1; i <= count; i++) {
      const url = `${galleryUrl}?p=${i}`
      const body = await this.crawler.adapter.get(url)
      const $ = cheerio.load(body)
      pages.push(...(await this.getPages($)))
    }

    const tags = this.extractTags($)
    return {
      url: galleryUrl,
      thumbnailUrl,
      title,
      titleJpn,
      pages,
      tags
    }
  }
}
