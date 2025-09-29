import { ArrayElValidator } from "./@types";

export function isString(value: any): value is string {
    return typeof value == "string";
}

export function isNumber(value: any): value is number {
    return typeof value == "number";
}

export function isBoolean(value: any): value is boolean {
    return typeof value == "boolean";
}

export function isArray<T>(
    value: any,
    fn: ArrayElValidator<T>
): value is Array<T> {
    if (!Array.isArray(value)) return false;

    for (const el of value) if (!fn(el)) return false;
    return true;
}
