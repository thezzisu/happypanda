import './preload'
import { getGalleryInfo } from './crawler'
import { getGalleryPageInfo } from './crawler/gallery'
import { download } from './http'

async function main() {
  const info = await getGalleryInfo(
    'https://e-hentai.org/g/1991643/100fb249d9/'
  )
  console.log(info)
  const page = await getGalleryPageInfo(info.pages[0].url)
  console.log(page)
  await download(page.originalUrl, page.filename)
}

main()
