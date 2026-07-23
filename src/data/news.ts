import type { NewsItem, EventItem } from "../types/news";

export const news: NewsItem[] = [
    {
        title: "ПМУ запускає новий молодіжний проєкт",
        excerpt:
            "Розповідаємо про нову ініціативу та можливості для молоді.",

        slug: "new-youth-project",
        author: "Патріотична молодь України",
        category: "Проєкти",

        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",

        date: "2026-07-19",
        featured: true,
        tags: ["молодь", "проєкти"],

        content: [
            {
                type: "paragraph",
                text: "Патріотична молодь України оголошує старт нового молодіжного проєкту.",
            },
            {
                type: "paragraph",
                text: "Учасники зможуть долучитися до освітніх, медійних і громадських ініціатив.",
            },
        ],
    },
    {
        title: "Відбулася зустріч команди ПМУ",
        excerpt:
            "Команда обговорила майбутні заходи та розвиток організації.",

        slug: "team-meeting",
        author: "Патріотична молодь України",
        category: "Команда",

        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",

        date: "2026-07-15",
        featured: true,

        content: [
            {
                type: "paragraph",
                text: "Під час зустрічі команда визначила основні напрями роботи на найближчі місяці.",
            },
        ],
    },
    {
        title: "Відкрито набір до нового напряму",
        excerpt:
            "Запрошуємо молодих людей долучатися до команди.",

        slug: "new-team-recruitment",
        author: "Патріотична молодь України",
        category: "Організація",

        cardImage: "/img/articles/image.png",
        heroImage: "/img/articles/image.png",

        date: "2026-07-10",
        featured: true,

        content: [
            {
                type: "paragraph",
                text: "Розпочався набір учасників до нового напряму діяльності організації.",
            },
        ],
    },
];

export const events: EventItem[] = [
    {
        title: "Зустріч нових учасників",
        date: "2026-07-27",
        time: "18:00",
        location: "Онлайн",
    },
    {
        title: "Молодіжна дискусія",
        date: "2026-08-03",
        time: "16:30",
        location: "Київ",
    },
];