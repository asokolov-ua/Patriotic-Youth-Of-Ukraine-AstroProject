import type { ArticleBlock } from "../data/articles";

export function getReadingTime(content: ArticleBlock[]): number {
    const text = content
        .map((block) => {
            switch (block.type) {
                case "paragraph":
                case "heading":
                case "quote":
                case "info":
                    return block.text;

                case "image-left":
                case "image-right":
                    return block.text;

                case "list":
                    return block.items.join(" ");

                case "cta":
                    return `${block.title} ${block.text ?? ""}`;

                case "gallery":
                    return block.title ?? "";

                case "youtube":
                    return `${block.title ?? ""} ${block.caption ?? ""}`;

                case "full-image":
                    return block.caption ?? "";

                default:
                    return "";
            }
        })
        .join(" ");

    const wordCount = text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.ceil(wordCount / 200));
}