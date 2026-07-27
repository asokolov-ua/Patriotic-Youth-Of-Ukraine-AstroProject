import type {
    PageObjectResponse,
    RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import type { TeamMember } from "../../types/team";
import { notion } from "./client";

const teamDatabaseId =
    import.meta.env.NOTION_TEAM_DATABASE_ID;

if (!teamDatabaseId) {
    throw new Error(
        "Не знайдено NOTION_TEAM_DATABASE_ID у файлі .env",
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

async function getTeamDataSourceId(): Promise<string> {
    const database =
        await notion.databases.retrieve({
            database_id: teamDatabaseId,
        });

    if (!("data_sources" in database)) {
        throw new Error(
            "Notion не повернув data_sources для Team",
        );
    }

    const dataSource =
        database.data_sources[0];

    if (!dataSource) {
        throw new Error(
            "У базі Team не знайдено data source",
        );
    }

    return dataSource.id;
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

function mapNotionPageToTeamMember(
    page: PageObjectResponse,
): TeamMember {
    return {
        name: getTitleProperty(page, "Name"),
        role: getRichTextProperty(page, "Role"),
        photo: getFileProperty(page, "Photo"),
        bio: getRichTextProperty(page, "Bio"),
        order: getNumberProperty(page, "Order"),
        showOnWebsite: getCheckboxProperty(
            page,
            "Show on Website",
        ),
    };
}

function getNumberProperty(
    page: PageObjectResponse,
    propertyName: string,
): number {
    const property = page.properties[propertyName];

    if (!property || property.type !== "number") {
        return Number.MAX_SAFE_INTEGER;
    }

    return property.number ?? Number.MAX_SAFE_INTEGER;
}


// export async function getNotionTeam(): Promise<TeamMember[]> {
//     const dataSourceId = await getTeamDataSourceId();

//     const response = await notion.dataSources.query({
//         data_source_id: dataSourceId,

//         sorts: [
//             {
//                 property: "Order",
//                 direction: "ascending",
//             },
//         ],
//     });

//     return response.results
//         .filter(isFullPage)
//         .map(mapNotionPageToTeamMember)
//         .filter(
//             (member) =>
//                 member.name &&
//                 member.role &&
//                 member.photo,
//         )
//         .sort((a, b) => a.order - b.order);
// }

async function getAllNotionTeam(): Promise<TeamMember[]> {
    const dataSourceId = await getTeamDataSourceId();

    const response = await notion.dataSources.query({
        data_source_id: dataSourceId,

        sorts: [
            {
                property: "Order",
                direction: "ascending",
            },
        ],
    });

    return response.results
        .filter(isFullPage)
        .map(mapNotionPageToTeamMember)
        .filter((member) => member.name)
        .sort((a, b) => a.order - b.order);
}

export async function getNotionTeam(): Promise<TeamMember[]> {
    const members = await getAllNotionTeam();

    return members.filter(
        (member) =>
            member.showOnWebsite &&
            member.role &&
            member.photo,
    );
}

export async function getNotionTeamCount(): Promise<number> {
    const members = await getAllNotionTeam();

    return members.length;
}

