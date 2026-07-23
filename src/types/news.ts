import type { BasePost } from "./post";
import type { ArticleBlock } from "../data/articles";

export interface NewsItem extends BasePost {
    featured?: boolean;
    tags?: string[];
    content: ArticleBlock[];
}

export interface EventItem {
    title: string;
    date: string;
    time?: string;
    location?: string;
    href?: string;
}