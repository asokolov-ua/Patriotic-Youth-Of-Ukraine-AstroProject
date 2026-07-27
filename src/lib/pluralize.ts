export function pluralize(
    count: number,
    one: string,
    few: string,
    many: string,
): string {
    const normalizedCount = Math.abs(count);
    const lastTwoDigits = normalizedCount % 100;
    const lastDigit = normalizedCount % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return many;
    }

    if (lastDigit === 1) {
        return one;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return few;
    }

    return many;
}