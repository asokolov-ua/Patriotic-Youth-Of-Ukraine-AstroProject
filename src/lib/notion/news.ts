import type {
    PageObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type { NewsItem } from "../../types/news";

import { notion } from "./client";
import { getNotionArticleBlocks } from "./articleBlocks";

const newsDatabaseId =
    import.meta.env.NOTION_NEWS_DATABASE_ID;

if (!newsDatabaseId) {
    throw new Error(
        "Не знайдено NOTION_NEWS_DATABASE_ID у файлі .env",
    );
}

function isFullPage(
    page: unknown,
): page is PageObjectResponse {
    return (
        typeof page === "object" &&
        page !== null &&
        "object" in page &&
        page.object === "page" &&
        "properties" in page
    );
}

function richTextToPlainText(
    richText: RichTextItemResponse[],
): string {
    return richText
        .map((item) => item.plain_text)
        .join("");
}

function getTitleProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property =
        page.properties[propertyName];

    if (!property || property.type !== "title") {
        return "";
    }

    return richTextToPlainText(property.title);
}

function getRichTextProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property =
        page.properties[propertyName];

    if (
        !property ||
        property.type !== "rich_text"
    ) {
        return "";
    }

    return richTextToPlainText(
        property.rich_text,
    );
}

function getSelectProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property =
        page.properties[propertyName];

    if (!property || property.type !== "select") {
        return "";
    }

    return property.select?.name ?? "";
}

function getCheckboxProperty(
    page: PageObjectResponse,
    propertyName: string,
): boolean {
    const property =
        page.properties[propertyName];

    if (
        !property ||
        property.type !== "checkbox"
    ) {
        return false;
    }

    return property.checkbox;
}

function getDateProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property =
        page.properties[propertyName];

    if (!property || property.type !== "date") {
        return "";
    }

    return property.date?.start ?? "";
}

function getFileProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property =
        page.properties[propertyName];

    if (!property || property.type !== "files") {
        return "";
    }

    const firstFile = property.files[0];

    if (!firstFile) {
        return "";
    }

    if (firstFile.type === "external") {
        return firstFile.external.url;
    }

    return firstFile.file.url;
}

async function getNewsDataSourceId(): Promise<string> {
    const database =
        await notion.databases.retrieve({
            database_id: newsDatabaseId,
        });

    if (!("data_sources" in database)) {
        throw new Error(
            "Notion не повернув data_sources для News",
        );
    }

    const dataSource =
        database.data_sources[0];

    if (!dataSource) {
        throw new Error(
            "У базі News не знайдено data source",
        );
    }

    return dataSource.id;
}

async function mapNotionPageToNewsItem(
    page: PageObjectResponse,
): Promise<NewsItem> {
    const content =
        await getNotionArticleBlocks(page.id);


    return {
        title: getTitleProperty(page, "Title"),
        slug: getRichTextProperty(page, "Slug"),
        excerpt: getRichTextProperty(
            page,
            "Excerpt",
        ),
        author: getRichTextProperty(
            page,
            "Author",
        ),
        category: getSelectProperty(
            page,
            "Category",
        ),
        date: getDateProperty(
            page,
            "Published At",
        ),
        featured: getCheckboxProperty(
            page,
            "Featured",
        ),
        cardImage: getFileProperty(
            page,
            "Card Image",
        ),
        heroImage: getFileProperty(
            page,
            "Hero Image",
        ),
        content,
    };
}

export async function getNotionNews(): Promise<
    NewsItem[]
> {
    const dataSourceId =
        await getNewsDataSourceId();

    const response =
        await notion.dataSources.query({
            data_source_id: dataSourceId,

            filter: {
                property: "Published",
                checkbox: {
                    equals: true,
                },
            },

            sorts: [
                {
                    property: "Published At",
                    direction: "descending",
                },
            ],
        });

    const pages =
        response.results.filter(isFullPage);

    const news = await Promise.all(
        pages.map(mapNotionPageToNewsItem),
    );

    return news.filter(
        (item) =>
            item.title &&
            item.slug &&
            item.date,
    );
}