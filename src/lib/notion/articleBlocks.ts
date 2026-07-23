import type {
    BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type { ArticleBlock } from "../../data/articles";

import { notion } from "./client";

import {
    getListItemText,
    getNotionImageData,
    mapNotionBlock,
    richTextToPlainText,
} from "./mappers";

type CollectionResult = {
    block: ArticleBlock;
    nextIndex: number;
};

type SideImageType =
    | "image-left"
    | "image-right";

async function getAllBlockChildren(
    blockId: string,
): Promise<BlockObjectResponse[]> {
    const blocks: BlockObjectResponse[] = [];
    let cursor: string | undefined;

    do {
        const response =
            await notion.blocks.children.list({
                block_id: blockId,
                page_size: 100,
                start_cursor: cursor,
            });

        for (const result of response.results) {
            if ("type" in result) {
                blocks.push(
                    result as BlockObjectResponse,
                );
            }
        }

        cursor = response.has_more
            ? response.next_cursor ?? undefined
            : undefined;
    } while (cursor);

    return blocks;
}

function isParagraphBlock(
    block: BlockObjectResponse,
): block is Extract<
    BlockObjectResponse,
    { type: "paragraph" }
> {
    return block.type === "paragraph";
}

function isCalloutBlock(
    block: BlockObjectResponse,
): block is Extract<
    BlockObjectResponse,
    { type: "callout" }
> {
    return block.type === "callout";
}

function isImageBlock(
    block: BlockObjectResponse,
): block is Extract<
    BlockObjectResponse,
    { type: "image" }
> {
    return block.type === "image";
}

function isBulletedListItem(
    block: BlockObjectResponse,
): block is Extract<
    BlockObjectResponse,
    { type: "bulleted_list_item" }
> {
    return block.type === "bulleted_list_item";
}

function isNumberedListItem(
    block: BlockObjectResponse,
): block is Extract<
    BlockObjectResponse,
    { type: "numbered_list_item" }
> {
    return block.type === "numbered_list_item";
}

function getCalloutText(
    block: Extract<
        BlockObjectResponse,
        { type: "callout" }
    >,
): string {
    return richTextToPlainText(
        block.callout.rich_text,
    ).trim();
}

function normalizeCommand(
    value: string,
): string {
    return value
        .trim()
        .toLocaleLowerCase("uk-UA")
        .replace(/\s+/g, " ");
}

function getSideImageType(
    text: string,
): SideImageType | null {
    const normalized = normalizeCommand(text);

    if (
        normalized === "фото зліва" ||
        normalized === "зображення зліва" ||
        normalized === "image-left"
    ) {
        return "image-left";
    }

    if (
        normalized === "фото справа" ||
        normalized === "зображення справа" ||
        normalized === "image-right"
    ) {
        return "image-right";
    }

    return null;
}

function collectSideImage(
    blocks: BlockObjectResponse[],
    directiveIndex: number,
    type: SideImageType,
): CollectionResult | null {
    const paragraph =
        blocks[directiveIndex + 1];

    const imageBlock =
        blocks[directiveIndex + 2];

    if (
        !paragraph ||
        !imageBlock ||
        !isParagraphBlock(paragraph) ||
        !isImageBlock(imageBlock)
    ) {
        return null;
    }

    const text = richTextToPlainText(
        paragraph.paragraph.rich_text,
    ).trim();

    if (!text) return null;

    const image =
        getNotionImageData(imageBlock);

    return {
        block: {
            type,
            text,
            image: image.src,
            alt:
                image.caption ||
                image.alt ||
                "Зображення статті",
        },

        nextIndex: directiveIndex + 3,
    };
}

function extractLabeledValue(
    lines: string[],
    acceptedLabels: string[],
): string | undefined {
    for (const line of lines) {
        const separatorIndex =
            line.indexOf(":");

        if (separatorIndex === -1) {
            continue;
        }

        const label = normalizeCommand(
            line.slice(0, separatorIndex),
        );

        const value = line
            .slice(separatorIndex + 1)
            .trim();

        if (
            acceptedLabels.includes(label) &&
            value
        ) {
            return value;
        }
    }

    return undefined;
}

function parseCtaCallout(
    text: string,
): ArticleBlock | null {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const command = normalizeCommand(
        lines[0] ?? "",
    );

    if (
        command !== "cta" &&
        command !== "заклик до дії"
    ) {
        return null;
    }

    const contentLines = lines.slice(1);

    const title = extractLabeledValue(
        contentLines,
        ["заголовок", "title"],
    );

    const description = extractLabeledValue(
        contentLines,
        ["текст", "опис", "text"],
    );

    const buttonText = extractLabeledValue(
        contentLines,
        ["кнопка", "button"],
    );

    const buttonHref = extractLabeledValue(
        contentLines,
        [
            "посилання",
            "адреса",
            "link",
            "url",
        ],
    );

    if (
        !title ||
        !buttonText ||
        !buttonHref
    ) {
        console.warn(
            "CTA у Notion пропущено: потрібні Заголовок, Кнопка та Посилання.",
        );

        return null;
    }

    const external =
        /^(https?:\/\/|mailto:|tel:)/i.test(
            buttonHref,
        );

    return {
        type: "cta",
        title,
        text: description,
        buttonText,
        buttonHref,
        external,
    };
}

function collectList(
    blocks: BlockObjectResponse[],
    startIndex: number,
): CollectionResult {
    const firstBlock = blocks[startIndex];

    if (
        !firstBlock ||
        (
            !isBulletedListItem(firstBlock) &&
            !isNumberedListItem(firstBlock)
        )
    ) {
        throw new Error(
            "collectList викликано не для списку",
        );
    }

    const ordered =
        firstBlock.type === "numbered_list_item";

    const targetType = firstBlock.type;
    const items: string[] = [];

    let index = startIndex;

    while (index < blocks.length) {
        const currentBlock = blocks[index];

        if (
            !currentBlock ||
            currentBlock.type !== targetType
        ) {
            break;
        }

        if (
            isBulletedListItem(currentBlock) ||
            isNumberedListItem(currentBlock)
        ) {
            const text =
                getListItemText(currentBlock);

            if (text) {
                items.push(text);
            }
        }

        index += 1;
    }

    return {
        block: {
            type: "list",
            ordered,
            items,
        },

        nextIndex: index,
    };
}

function collectImages(
    blocks: BlockObjectResponse[],
    startIndex: number,
): CollectionResult {
    const images: {
        src: string;
        alt: string;
        caption?: string;
    }[] = [];

    let index = startIndex;

    while (index < blocks.length) {
        const currentBlock = blocks[index];

        if (
            !currentBlock ||
            !isImageBlock(currentBlock)
        ) {
            break;
        }

        images.push(
            getNotionImageData(currentBlock),
        );

        index += 1;
    }

    const firstImage = images[0];

    if (!firstImage) {
        throw new Error(
            "collectImages не знайшов зображень",
        );
    }

    if (images.length === 1) {
        return {
            block: {
                type: "full-image",
                image: firstImage.src,
                alt: firstImage.alt,
                caption: firstImage.caption,
            },

            nextIndex: index,
        };
    }

    return {
        block: {
            type: "gallery",
            images,
        },

        nextIndex: index,
    };
}

function mapNotionBlocks(
    notionBlocks: BlockObjectResponse[],
): ArticleBlock[] {
    const articleBlocks: ArticleBlock[] = [];
    let index = 0;

    while (index < notionBlocks.length) {
        const currentBlock =
            notionBlocks[index];

        if (!currentBlock) {
            index += 1;
            continue;
        }

        if (isCalloutBlock(currentBlock)) {
            const calloutText =
                getCalloutText(currentBlock);

            const sideImageType =
                getSideImageType(calloutText);

            if (sideImageType) {
                const sideImage =
                    collectSideImage(
                        notionBlocks,
                        index,
                        sideImageType,
                    );

                if (sideImage) {
                    articleBlocks.push(
                        sideImage.block,
                    );

                    index =
                        sideImage.nextIndex;

                    continue;
                }

                console.warn(
                    `"${calloutText}" потребує абзац і зображення одразу після Callout.`,
                );

                index += 1;
                continue;
            }

            const cta =
                parseCtaCallout(calloutText);

            if (cta) {
                articleBlocks.push(cta);
                index += 1;
                continue;
            }
        }

        if (
            isBulletedListItem(currentBlock) ||
            isNumberedListItem(currentBlock)
        ) {
            const result = collectList(
                notionBlocks,
                index,
            );

            if (
                result.block.type === "list" &&
                result.block.items.length > 0
            ) {
                articleBlocks.push(
                    result.block,
                );
            }

            index = result.nextIndex;
            continue;
        }

        if (isImageBlock(currentBlock)) {
            const result = collectImages(
                notionBlocks,
                index,
            );

            articleBlocks.push(
                result.block,
            );

            index = result.nextIndex;
            continue;
        }

        const mappedBlock =
            mapNotionBlock(currentBlock);

        if (mappedBlock) {
            articleBlocks.push(
                mappedBlock,
            );
        }

        index += 1;
    }

    return articleBlocks;
}

export async function getNotionArticleBlocks(
    pageId: string,
): Promise<ArticleBlock[]> {
    const notionBlocks =
        await getAllBlockChildren(pageId);

    return mapNotionBlocks(
        notionBlocks,
    );
}