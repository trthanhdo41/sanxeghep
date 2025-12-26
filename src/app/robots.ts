import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/api/', '/_next/', '/hanh-khach/', '/tai-xe/quan-ly-chuyen-di'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/profile/', '/api/', '/hanh-khach/', '/tai-xe/quan-ly-chuyen-di'],
      },
    ],
    sitemap: 'https://sanxeghep.vn/sitemap.xml',
  }
}
