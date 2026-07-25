import type {
    PageObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type { Event } from "../../types/event";
import { notion } from "./client";

const eventsDatabaseId =
    import.meta.env.NOTION_EVENTS_DATABASE_ID;

if (!eventsDatabaseId) {
    throw new Error(
        "Не знайдено NOTION_EVENTS_DATABASE_ID у .env",
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

    if (!property || property.type !== "rich_text") {
        return "";
    }

    return richTextToPlainText(
        property.rich_text,
    );
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

function getNumberProperty(
    page: PageObjectResponse,
    propertyName: string,
): number {
    const property =
        page.properties[propertyName];

    if (!property || property.type !== "number") {
        return Number.MAX_SAFE_INTEGER;
    }

    return (
        property.number ??
        Number.MAX_SAFE_INTEGER
    );
}

async function getEventsDataSourceId(): Promise<string> {
    const database =
        await notion.databases.retrieve({
            database_id: eventsDatabaseId,
        });

    if (!("data_sources" in database)) {
        throw new Error(
            "Notion не повернув data_sources для Events",
        );
    }

    const dataSource =
        database.data_sources[0];

    if (!dataSource) {
        throw new Error(
            "У базі Events не знайдено data source",
        );
    }

    return dataSource.id;
}

function mapNotionPageToEvent(
    page: PageObjectResponse,
): Event {
    return {
        title: getTitleProperty(page, "Title"),
        date: getDateProperty(page, "Date"),
        time: getRichTextProperty(page, "Time"),
        location: getRichTextProperty(
            page,
            "Location",
        ),
        description: getRichTextProperty(
            page,
            "Description",
        ),
        order: getNumberProperty(page, "Order"),
    };
}

export async function getNotionEvents(): Promise<
    Event[]
> {
    const dataSourceId =
        await getEventsDataSourceId();

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
                    property: "Date",
                    direction: "ascending",
                },
                {
                    property: "Order",
                    direction: "ascending",
                },
            ],
        });

    return response.results
        .filter(isFullPage)
        .map(mapNotionPageToEvent)
        .filter(
            (event) =>
                event.title &&
                event.date &&
                event.time &&
                event.location,
        )
        .sort((a, b) => {
            const dateDifference =
                new Date(a.date).getTime() -
                new Date(b.date).getTime();

            if (dateDifference !== 0) {
                return dateDifference;
            }

            return a.order - b.order;
        });
}