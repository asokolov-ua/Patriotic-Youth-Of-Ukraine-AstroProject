export interface BasePost {
    title: string;
    excerpt: string;
    slug: string;

    author: string;
    category: string;

    cardImage: string;
    heroImage: string;
    heroVideo?: string;

    date: string;
    updatedAt?: string;

    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
}