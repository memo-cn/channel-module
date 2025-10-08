// 判断是否为对象
export function isObject(arg: any): arg is Record<any, any> {
    return Object.is(Object(arg), arg);
}
