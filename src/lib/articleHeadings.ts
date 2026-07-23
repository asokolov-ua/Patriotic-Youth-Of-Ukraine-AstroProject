import type { ArticleBlock } from "../data/articles";
import { slugify } from "./slugify";

export interface ArticleHeading {
    text: string;
    id: string;
    blockIndex: number;
}

export function getArticleHeadings(
    content: ArticleBlock[],
): ArticleHeading[] {
    const usedIds = new Map<string, number>();

    return content.flatMap((block, blockIndex) => {
        if (block.type !== "heading") return [];

        const baseId = slugify(block.text) || `section-${blockIndex + 1}`;
        const occurrences = usedIds.get(baseId) ?? 0;

        usedIds.set(baseId, occurrences + 1);

        const id =
            occurrences === 0
                ? baseId
                : `${baseId}-${occurrences + 1}`;

        return [
            {
                text: block.text,
                id,
                blockIndex,
            },
        ];
    });
}