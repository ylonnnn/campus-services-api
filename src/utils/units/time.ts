export const MILLISECOND = 1_000;

export function SECOND(value: number) {
    return value * MILLISECOND;
}

export function MINUTE(value: number) {
    return SECOND(value) * 60;
}

export function HOUR(value: number) {
    return MINUTE(value) * 60;
}
