import { Client } from "@notionhq/client";

const notionToken = import.meta.env.NOTION_TOKEN;

if (!notionToken) {
    throw new Error("Не знайдено NOTION_TOKEN у файлі .env");
}

export const notion = new Client({
    auth: notionToken,
});