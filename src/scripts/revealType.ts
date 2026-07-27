import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const elements = document.querySelectorAll<HTMLElement>(".reveal-type");

elements.forEach((element) => {
    const backgroundColor =
        element.dataset.bgColor ?? "#DCE4E7";

    const foregroundColor =
        element.dataset.fgColor ?? "#779EA5";

    const split = new SplitType(element, {
        types: "chars",
    });

    if (!split.chars) {
        return;
    }

    gsap.set(split.chars, {
        color: backgroundColor,
    });

    gsap.to(split.chars, {
        color: foregroundColor,
        stagger: 0.04,
        ease: "none",

        scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
        },
    });
});