import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/profile/', '/review/start'],
        },
        sitemap: 'https://chinesemaster.com/sitemap.xml',
    };
}
