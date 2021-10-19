import './preload'
import { getGalleryInfo } from './crawler'

async function main() {
  const info = await getGalleryInfo('1991643/100fb249d9')
  console.log(info)
}

main()
