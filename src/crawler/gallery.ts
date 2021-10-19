import { http } from '../http'
import cheerio, { CheerioAPI } from 'cheerio'
import { URL } from 'url'

function extractTitle($: CheerioAPI) {
  return [$('#gn').text(), $('#gj').text()] as const
}

function extractThumbnail($: CheerioAPI) {
  return $('#gd1')
    .children()
    .first()
    .css('background')!
    .match(/url\((.*)\)/)![1]
}

function extractPageCount($: CheerioAPI) {
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

export interface IGalleryPage {
  url: string
  thumbnailUrl: string
}

function extractPages($: CheerioAPI): IGalleryPage[] {
  return $('#gdt > .gdtl')
    .get()
    .map((elem) => ({
      url: $(elem).find('a').attr('href')!,
      thumbnailUrl: $(elem).find('img').attr('src')!
    }))
}

function extractTags($: CheerioAPI) {
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

export interface IGalleryInfo {
  thumbnailUrl: string
  title: string
  titleJpn: string
  pages: IGalleryPage[]
  tags: string[]
}

export async function getGalleryInfo(
  galleryUrl: string
): Promise<IGalleryInfo> {
  const { body } = await http.get(galleryUrl)
  const $ = cheerio.load(body)
  const [title, titleJpn] = extractTitle($)
  const thumbnailUrl = extractThumbnail($)

  const count = extractPageCount($)
  const pages = extractPages($)
  for (let i = 1; i <= count; i++) {
    const url = `${galleryUrl}?p=${i}`
    const { body } = await http.get(url)
    const $ = cheerio.load(body)
    pages.push(...extractPages($))
  }

  const tags = extractTags($)
  return {
    thumbnailUrl,
    title,
    titleJpn,
    pages,
    tags
  }
}

export interface IGalleryPageInfo {
  filename: string
  imageUrl: string
  originalUrl: string
}

export async function getGalleryPageInfo(
  galleryPageUrl: string
): Promise<IGalleryPageInfo> {
  const { body } = await http.get(galleryPageUrl)
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
