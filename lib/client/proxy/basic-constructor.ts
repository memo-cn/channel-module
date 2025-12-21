import { Operation, OperationType } from '../../common/operation';
import { uuid } from '../../utils/uuid';
import { defineProperty, deleteProperty, set, setPrototypeOf } from './extended-constructor';
import { pkgName } from '../../utils/const';
import { stringifyValue } from '../../utils/stringify-value';

export type ProxyOptions = {
    // 调用队列
    invokeQueue: any[];
};

// 记录所有 operations
export const operationsSet = new WeakSet<Operation[]>();

// 存储 proxy 到 state 的映射关系
export const proxyToState = new WeakMap<
    any,
    {
        // 当前的操作队列
        operations: Operation[];
        options: ProxyOptions;
    }
>();

export function getProxyStateOrThrow(proxy: any) {
    const state = proxyToState.get(proxy);
    if (!state) {
        throw new Error(`${stringifyValue(proxy)} is not a ${pkgName} Proxy.`);
    }
    return state;
}

// 从下一个操作, 创建下一个 Proxy
export function nextProxy<T extends Omit<Operation, 'id'>>(curProxy: any, nextOperation: T): any {
    const { options, operations } = getProxyStateOrThrow(curProxy);
    (nextOperation as any as Operation).id = uuid();
    const nextProxy = createProxy(operations.concat(nextOperation as any as Operation), options);
    options.invokeQueue.push(nextProxy);
    return nextProxy;
}

// 从操作队列, 创建 Proxy
export function createProxy(operations: Operation[], options: ProxyOptions): any {
    const proxy = new Proxy(function () {}, {
        apply(target, thisArg: any, argArray: any[]): any {
            return nextProxy(proxy, {
                type: OperationType.apply,
                argArray,
            });
        },
        construct(target, argArray: any[], newTarget: Function): object {
            return nextProxy(proxy, {
                type: OperationType.construct,
                argArray,
            });
        },
        defineProperty(target, property: string, attributes: PropertyDescriptor): boolean {
            defineProperty(proxy, property as keyof typeof proxy, attributes);
            return true;
        },
        deleteProperty(target, property: string): boolean {
            deleteProperty(proxy, property as keyof typeof proxy);
            return true;
        },
        get(target: {}, property: string, receiver: any): any {
            return nextProxy(proxy, {
                type: OperationType.get,
                property,
            });
        },
        getOwnPropertyDescriptor(target, property: string): PropertyDescriptor | undefined {
            throw new Error('Please use the independent "getOwnPropertyDescriptor" method.');
        },
        getPrototypeOf(target): object | null {
            return nextProxy(proxy, {
                type: OperationType.getPrototypeOf,
            });
        },
        has(target, property: string): boolean {
            throw new Error('Please use the independent "has" method.');
        },
        isExtensible(target): boolean {
            throw new Error('Please use the independent "isExtensible" method.');
        },
        ownKeys(target): ArrayLike<string | symbol> {
            throw new Error('Please use the independent "ownKeys" method.');
        },
        preventExtensions(target): boolean {
            throw new Error('Please use the independent "preventExtensions" method.');
        },
        set(target, property: string, newValue: any, receiver: any): boolean {
            set(proxy, property as keyof typeof proxy, newValue);
            return true;
        },
        setPrototypeOf(target, prototype: object | null): boolean {
            setPrototypeOf(proxy, prototype);
            return true;
        },
    });
    proxyToState.set(proxy, {
        operations,
        options,
    });
    operationsSet.add(operations);
    return proxy;
}
