import { OperationType } from '../../common/operation';
import { nextProxy, getProxyStateOrThrow } from './basic-constructor';

export function defineProperty<T>(
    proxy: T,
    property: string | number,
    attributes: PropertyDescriptor & ThisType<any>,
): T {
    return nextProxy(proxy, {
        type: OperationType.defineProperty,
        property,
        attributes,
    });
}

export function getOwnPropertyDescriptor<T, P>(
    proxy: T,
    property: P,
): TypedPropertyDescriptor<P extends keyof T ? T[P] : any> {
    return nextProxy(proxy, {
        type: OperationType.getOwnPropertyDescriptor,
        property,
    });
}

export function has<T>(proxy: T, property: string): boolean {
    return nextProxy(proxy, {
        type: OperationType.has,
        property,
    });
}

export function isExtensible<T>(proxy: T): boolean {
    return nextProxy(proxy, {
        type: OperationType.isExtensible,
    });
}

export function ownKeys<T>(proxy: T): ArrayLike<string> {
    return nextProxy(proxy, {
        type: OperationType.ownKeys,
    });
}

export function preventExtensions<T>(proxy: T): ArrayLike<string> {
    return nextProxy(proxy, {
        type: OperationType.preventExtensions,
    });
}

export function setPrototypeOf<T>(proxy: T, prototype: object | null): boolean {
    return nextProxy(proxy, {
        type: OperationType.setPrototypeOf,
        prototype,
    });
}

export function deleteProperty<T>(proxy: T, property: keyof T): boolean {
    return nextProxy(proxy, {
        type: OperationType.deleteProperty,
        property: property as any,
    });
}

export function set<Value>(value: Value, newValue: Value): Value;

export function set<Object, Value>(proxy: Object, property: keyof Object, newValue: Value): Value;

export function set<T, V>(...args: any[]): V {
    const proxy: T = args[0];
    const { operations, options } = getProxyStateOrThrow(proxy);
    let property: keyof T;
    let newValue: V;
    if (args.length >= 3) {
        [property, newValue] = args.slice(1);
    } else {
        newValue = args[1];
        const lastOperation = operations.pop();
        if (!lastOperation || lastOperation.type !== OperationType.get) {
            throw new Error(`Please specify the 'property' parameter`);
        }
        property = lastOperation.property as keyof T;
    }
    return nextProxy(proxy, {
        type: OperationType.set,
        property: property as any,
        newValue,
    });
}

export function Await<T>(proxy: T): Awaited<T> {
    return nextProxy(proxy, {
        type: OperationType.await,
    });
}

/**
 * 转换为布尔值
 * Convert to Boolean value
 */
export function boolean<T>(proxy: T): boolean {
    return nextProxy(proxy, {
        type: OperationType.boolean,
    });
}

/**
 * 可选链
 * Optional chaining
 */
export function optional<T>(proxy: T): NonNullable<T> {
    return nextProxy(proxy, {
        type: OperationType.optional,
    });
}

export function typeOf<T>(
    proxy: T,
): 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' {
    return nextProxy(proxy, {
        type: OperationType.typeOf,
    });
}
