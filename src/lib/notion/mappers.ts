import type {
    BlockObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type { ArticleBlock } from "../../data/articles";

export function richTextToPlainText(
    richText: RichTextItemResponse[],
): string {
    return richText
        .map((item) => item.plain_text)
        .join("");
}

function mapParagraph(
    block: Extract<
        BlockObjectResponse,
        { type: "paragraph" }
    >,
): ArticleBlock | null {
    const text = richTextToPlainText(
        block.paragraph.rich_text,
    ).trim();

    if (!text) return null;

    return {
        type: "paragraph",
        text,
    };
}

function mapHeading(
    block: Extract<
        BlockObjectResponse,
        {
            type:
            | "heading_1"
            | "heading_2"
            | "heading_3";
        }
    >,
): ArticleBlock | null {
    let richText: RichTextItemResponse[];

    switch (block.type) {
        case "heading_1":
            richText = block.heading_1.rich_text;
            break;

        case "heading_2":
            richText = block.heading_2.rich_text;
            break;

        case "heading_3":
            richText = block.heading_3.rich_text;
            break;
    }

    const text = richTextToPlainText(richText).trim();

    if (!text) return null;

    return {
        type: "heading",
        text,
    };
}

function mapQuote(
    block: Extract<
        BlockObjectResponse,
        { type: "quote" }
    >,
): ArticleBlock | null {
    const text = richTextToPlainText(
        block.quote.rich_text,
    ).trim();

    if (!text) return null;

    return {
        type: "quote",
        text,
    };
}

export function getNotionImageData(
    block: Extract<
        BlockObjectResponse,
        { type: "image" }
    >,
): {
    src: string;
    alt: string;
    caption?: string;
} {
    const src =
        block.image.type === "external"
            ? block.image.external.url
            : block.image.file.url;

    const caption = richTextToPlainText(
        block.image.caption,
    ).trim();

    return {
        src,
        alt: caption || "Зображення статті",
        caption: caption || undefined,
    };
}

function mapImage(
    block: Extract<
        BlockObjectResponse,
        { type: "image" }
    >,
): ArticleBlock {
    const image = getNotionImageData(block);

    return {
        type: "full-image",
        image: image.src,
        alt: image.alt,
        caption: image.caption,
    };
}

function getCalloutVariant(
    color: string,
): "default" | "warning" | "success" {
    if (
        color.includes("yellow") ||
        color.includes("orange") ||
        color.includes("red")
    ) {
        return "warning";
    }

    if (color.includes("green")) {
        return "success";
    }

    return "default";
}

function mapCallout(
    block: Extract<
        BlockObjectResponse,
        { type: "callout" }
    >,
): ArticleBlock | null {
    const text = richTextToPlainText(
        block.callout.rich_text,
    ).trim();

    if (!text) return null;

    return {
        type: "info",
        variant: getCalloutVariant(
            block.callout.color,
        ),
        text,
    };
}

function extractYouTubeVideoId(
    url: string,
): string | null {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname === "youtu.be") {
            return (
                parsedUrl.pathname
                    .replace("/", "")
                    .trim() || null
            );
        }

        if (
            parsedUrl.hostname.includes("youtube.com")
        ) {
            const queryVideoId =
                parsedUrl.searchParams.get("v");

            if (queryVideoId) {
                return queryVideoId;
            }

            const embedMatch =
                parsedUrl.pathname.match(
                    /\/embed\/([^/?]+)/,
                );

            if (embedMatch?.[1]) {
                return embedMatch[1];
            }

            const shortsMatch =
                parsedUrl.pathname.match(
                    /\/shorts\/([^/?]+)/,
                );

            if (shortsMatch?.[1]) {
                return shortsMatch[1];
            }
        }

        return null;
    } catch {
        return null;
    }
}

function mapVideo(
    block: Extract<
        BlockObjectResponse,
        { type: "video" }
    >,
): ArticleBlock | null {
    const url =
        block.video.type === "external"
            ? block.video.external.url
            : block.video.file.url;

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) return null;

    const caption = richTextToPlainText(
        block.video.caption,
    ).trim();

    return {
        type: "youtube",
        videoId,
        caption: caption || undefined,
    };
}

function mapEmbed(
    block: Extract<
        BlockObjectResponse,
        { type: "embed" }
    >,
): ArticleBlock | null {
    const videoId = extractYouTubeVideoId(
        block.embed.url,
    );

    if (!videoId) return null;

    const caption = richTextToPlainText(
        block.embed.caption,
    ).trim();

    return {
        type: "youtube",
        videoId,
        caption: caption || undefined,
    };
}

export function getListItemText(
    block: Extract<
        BlockObjectResponse,
        {
            type:
            | "bulleted_list_item"
            | "numbered_list_item";
        }
    >,
): string {
    if (block.type === "bulleted_list_item") {
        return richTextToPlainText(
            block.bulleted_list_item.rich_text,
        ).trim();
    }

    return richTextToPlainText(
        block.numbered_list_item.rich_text,
    ).trim();
}

export function mapNotionBlock(
    block: BlockObjectResponse,
): ArticleBlock | null {
    switch (block.type) {
        case "paragraph":
            return mapParagraph(block);

        case "heading_1":
        case "heading_2":
        case "heading_3":
            return mapHeading(block);

        case "quote":
            return mapQuote(block);

        case "image":
            return mapImage(block);

        case "divider":
            return {
                type: "divider",
            };

        case "callout":
            return mapCallout(block);

        case "video":
            return mapVideo(block);

        case "embed":
            return mapEmbed(block);

        case "bulleted_list_item":
        case "numbered_list_item":
        case "code":
            return null;

        default:
            return null;
    }
}