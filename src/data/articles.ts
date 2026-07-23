import type { BasePost } from "../types/post";


export type ArticleBlock =
    | {
        type: "paragraph";
        text: string;
    }
    | {
        type: "heading";
        text: string;
    }
    | {
        type: "image-right";
        text: string;
        image: string;
        alt: string;
    }
    | {
        type: "image-left";
        text: string;
        image: string;
        alt: string;
    }
    | {
        type: "quote";
        text: string;
        author?: string;
    }
    | {
        type: "full-image";
        image: string;
        alt: string;
        caption?: string;
    }
    | {
        type: "list";
        items: string[];
        ordered?: boolean;
    }
    | {
        type: "divider";
    }
    | {
        type: "youtube";
        videoId: string;
        title?: string;
        caption?: string;
    }
    | {
        type: "gallery";
        images: {
            src: string;
            alt: string;
            caption?: string;
        }[];
        title?: string;
    }
    | {
        type: "info";
        variant?: "default" | "warning" | "success";
        title?: string;
        text: string;
    }
    | {
        type: "cta";
        title: string;
        text?: string;
        buttonText: string;
        buttonHref: string;
        external?: boolean;
    };

export interface Article extends BasePost {
    tags?: string[];
    content: ArticleBlock[];
    featured?: boolean;
    notionPageId?: string;
}

export const articles: Article[] = [
    {
        title: "Як молодь формує українську ідентичність",
        excerpt:
            "Розповідаємо про роль освіти, культури та молодіжних ініціатив.",

        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",

        seoTitle: "Як молодь формує українську ідентичність",
        seoDescription:
            "Про роль освіти, культури та молодіжних ініціатив у формуванні сучасної української ідентичності.",
        ogImage: "/img/articles/image.png",

        date: "2024-11-13",
        updatedAt: "2024-11-18",

        category: "Національна свідомість",
        tags: ["молодь", "ідентичність", "освіта"],

        slug: "ukrainian-identity",
        author: "Патріотична молодь України",

        content: [

            {
                type: "paragraph",
                text: "Українська молодь відіграє важливу роль у формуванні сучасної національної ідентичності.",
            },
            {
                type: "heading",
                text: "Роль молодіжних ініціатив",
            },
            {
                type: "paragraph",
                text: "Через освітні, культурні та громадські ініціативи молоді люди не лише вивчають історію, а й створюють нові способи її осмислення.",
            },
            {
                type: "image-right",
                text: "Особливе значення мають проєкти, які поєднують традиційні цінності із сучасними медіа, дизайном і цифровими технологіями.",
                image: "/img/articles/image.png",
                alt: "Учасники молодіжного проєкту",
            },

            {
                type: "quote",
                text: "Молодь не лише успадковує країну — вона формує те, якою ця країна буде завтра.",
                author: "Патріотична молодь України",
            },
            {
                type: "full-image",
                image: "/img/articles/image.png",
                alt: "Учасники молодіжної ініціативи",
                caption: "Команда під час роботи над новим проєктом",
            },
            {
                type: "list",
                items: [
                    "Освітні ініціативи",
                    "Культурні проєкти",
                    "Волонтерська діяльність",
                    "Робота з молоддю",
                ],
            },
            {
                type: "list",
                ordered: true,
                items: [
                    "Визначити проблему",
                    "Зібрати команду",
                    "Розробити план",
                    "Реалізувати проєкт",
                ],
            },
            {
                type: "divider",
            },
            {
                type: "youtube",
                videoId: "dQw4w9WgXcQ",
                title: "Відео до матеріалу",
                caption: "Додаткові матеріали за темою статті",
            },
            {
                type: "gallery",
                title: "Фотографії з проєкту",
                images: [
                    {
                        src: "/img/articles/image.png",
                        alt: "Учасники молодіжного проєкту",
                        caption: "Робота команди під час заходу",
                    },
                    {
                        src: "/img/articles/image.png",
                        alt: "Обговорення нового проєкту",
                        caption: "Спільне обговорення майбутніх ініціатив",
                    },
                    {
                        src: "/img/articles/image.png",
                        alt: "Молодіжна команда",
                    },
                ],
            },
            {
                type: "info",
                title: "Важливо",
                text: "Перед поширенням інформації завжди перевіряйте її першоджерело.",
            },
            {
                type: "info",
                variant: "warning",
                title: "Зверніть увагу",
                text: "Емоційний заголовок не завжди означає, що матеріал містить правдиву інформацію.",
            },
            {
                type: "info",
                variant: "success",
                title: "Корисна порада",
                text: "Порівнюйте одну новину щонайменше у двох незалежних джерелах.",
            },
            {
                type: "cta",
                title: "Приєднатися",
                buttonText: "Заповнити форму",
                buttonHref: "https://forms.gle/xxxxx",
                external: true,
            }
        ],
    },
    {
        title: "Як розпізнавати інформаційні маніпуляції",
        excerpt:
            "Пояснюємо, як перевіряти джерела та помічати маніпулятивні повідомлення.",
        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",
        date: "2024-11-08",
        slug: "information-manipulation",
        author: "Патріотична молодь України",
        category: "",
        content: [
            {
                type: "paragraph",
                text: "Інформаційний простір щодня впливає на наші рішення та уявлення про події.",
            },
            {
                type: "heading",
                text: "Перевірка джерел",
            },
            {
                type: "list",
                ordered: true,
                items: [
                    "Перевірте автора матеріалу.",
                    "Знайдіть першоджерело інформації.",
                    "Порівняйте повідомлення з іншими надійними джерелами.",
                ],
            },
        ],
    },
    {
        title: "Волонтерство як спосіб змінювати країну",
        excerpt:
            "Розповідаємо, як молодіжні ініціативи впливають на громади та суспільство.",
        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",
        date: "2024-11-02",
        slug: "volunteering",
        author: "Патріотична молодь України",
        category: "Громадська активність",
        tags: ["волонтерство", "молодь", "суспільство"],
        content: [
            {
                type: "paragraph",
                text: "Волонтерство дає молоді можливість не лише допомагати, а й брати відповідальність за зміни навколо.",
            },
            {
                type: "quote",
                text: "Навіть невелика дія може стати початком великої зміни.",
            },
            {
                type: "full-image",
                image: "/img/articles/image.png",
                alt: "Молодіжна волонтерська ініціатива",
            },
        ],
    },
];