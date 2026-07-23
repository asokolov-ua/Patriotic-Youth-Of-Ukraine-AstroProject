import type {
    PageObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type { Article } from "../../data/articles";

import { notion } from "./client";
import { getNotionArticleBlocks } from "./articleBlocks";

const databaseId = import.meta.env.NOTION_DATABASE_ID;

if (!databaseId) {
    throw new Error(
        "Не знайдено NOTION_DATABASE_ID у файлі .env",
    );
}

async function getArticlesDataSourceId(): Promise<string> {
    const database = await notion.databases.retrieve({
        database_id: databaseId,
    });

    if (!("data_sources" in database)) {
        throw new Error(
            "Notion не повернув список data_sources",
        );
    }

    const dataSource = database.data_sources[0];

    if (!dataSource) {
        throw new Error(
            "У базі Notion не знайдено data source",
        );
    }

    return dataSource.id;
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
    const property = page.properties[propertyName];

    if (!property || property.type !== "title") {
        return "";
    }

    return richTextToPlainText(property.title);
}

function getRichTextProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property = page.properties[propertyName];

    if (!property || property.type !== "rich_text") {
        return "";
    }

    return richTextToPlainText(property.rich_text);
}

function getCheckboxProperty(
    page: PageObjectResponse,
    propertyName: string,
): boolean {
    const property = page.properties[propertyName];

    if (!property || property.type !== "checkbox") {
        return false;
    }

    return property.checkbox;
}

function getSelectProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property = page.properties[propertyName];

    if (!property || property.type !== "select") {
        return "";
    }

    return property.select?.name ?? "";
}

function getMultiSelectProperty(
    page: PageObjectResponse,
    propertyName: string,
): string[] {
    const property = page.properties[propertyName];

    if (!property || property.type !== "multi_select") {
        return [];
    }

    return property.multi_select.map(
        (option) => option.name,
    );
}

function getDateProperty(
    page: PageObjectResponse,
    propertyName: string,
): string {
    const property = page.properties[propertyName];

    if (!property || property.type !== "date") {
        return "";
    }

    return property.date?.start ?? "";
}

async function mapNotionPageToArticle(
    page: PageObjectResponse,
): Promise<Article> {
    const title = getTitleProperty(page, "Title");
    const slug = getRichTextProperty(page, "Slug");
    const excerpt = getRichTextProperty(
        page,
        "Excerpt",
    );
    const author = getRichTextProperty(page, "Author");
    const category = getSelectProperty(
        page,
        "Category",
    );

    const tags = getMultiSelectProperty(page, "tags");

    const date = getDateProperty(
        page,
        "Published At",
    );

    const content = await getNotionArticleBlocks(
        page.id,
    );

    return {
        notionPageId: page.id,

        title,
        slug,
        excerpt,
        author,
        category,
        tags,
        date,

        featured: getCheckboxProperty(
            page,
            "Featured",
        ),

        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",

        content,
    };
}

export async function getNotionArticles(): Promise<
    Article[]
> {
    const dataSourceId =
        await getArticlesDataSourceId();

    const response = await notion.dataSources.query({
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

    const pages = response.results.filter(isFullPage);

    return Promise.all(
        pages.map(mapNotionPageToArticle),
    );
}