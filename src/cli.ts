#!/usr/bin/env node
import './preload'
import { NodeAdapter } from './adapter'
import { Crawler } from './crawler'
import CAC from 'cac'
import fs from 'fs-extra'
import { join } from 'path'

const cli = CAC()

cli
  .command('download <url>', 'Download a E-Hentai gallery')
  .option('-o, --output', 'Output folder')
  .option('-O, --origin', 'Download origin image, not resampled')
  .action(async (url, config) => {
    try {
      const crawler = new Crawler(new NodeAdapter())
      const gallery = await crawler.gallery.getGallery(url)
      console.log(`Downloading ${gallery.title}`)
      console.log(`Gallery tags: ${gallery.tags.join(',')}`)
      const dist = config.output ?? join(process.cwd(), gallery.title)
      await fs.ensureDir(dist)
      await crawler.downloader.downloadGallery(gallery, dist, config.origin)
    } catch (e) {
      console.error(e)
    }
  })

cli.help()

cli.parse()
