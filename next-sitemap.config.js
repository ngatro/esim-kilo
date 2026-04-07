/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://openworldesim.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: './public',
}
