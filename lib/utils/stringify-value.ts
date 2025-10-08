export function stringifyValue(any: any) {
    if (typeof any === 'function') {
        return `[function ${any.name}]`;
    }
    let r = String(any);
    if (typeof any === 'string') {
        r = '"' + r + '"';
    }
    return r;
}
