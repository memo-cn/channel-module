export type Operation = (
    | Apply
    | Construct
    | DefineProperty
    | DeleteProperty
    | Get
    | GetOwnPropertyDescriptor
    | GetPrototypeOf
    | Has
    | IsExtensible
    | OwnKeys
    | PreventExtensions
    | Set
    | SetPrototypeOf
    | Boolean
    | Optional
    | TypeOf
    | Await
) & { id: string };

const OperationsJsonTag = '__op_array_tag__' as const;

/**
 * 发送的消息应为 json 对象, 为了区分 Operation[] 和普通的 Array, 将前者转换为普通的 Object, 加上 tag 。
 */
type OperationsJson = { [OperationsJsonTag]: true } & {
    [index: number]: Operation;
    length: number;
};

export function operationsToJson(operations: Operation[]): OperationsJson {
    const oc = { [OperationsJsonTag]: true } as OperationsJson;
    for (let i = 0; i < operations.length; i++) {
        oc[i] = operations[i];
    }
    oc.length = operations.length;
    return oc;
}

export function jsonToOperations(operationChain: any): Operation[] | null {
    if (operationChain?.[OperationsJsonTag as any] && typeof operationChain?.length === 'number') {
        return Array.from(operationChain);
    }
    return null;
}

export const enum OperationType {
    apply = 'apply',
    construct = 'construct',
    defineProperty = 'defineProperty',
    deleteProperty = 'deleteProperty',
    get = 'get',
    getOwnPropertyDescriptor = 'getOwnPropertyDescriptor',
    getPrototypeOf = 'getPrototypeOf',
    has = 'has',
    isExtensible = 'isExtensible',
    ownKeys = 'ownKeys',
    preventExtensions = 'preventExtensions',
    set = 'set',
    setPrototypeOf = 'setPrototypeOf',
    await = 'await',
    boolean = 'boolean',
    optional = 'optional',
    typeOf = 'typeOf',
}

type Await = { type: OperationType.await };
type Boolean = { type: OperationType.boolean };
type Optional = { type: OperationType.optional };
type TypeOf = { type: OperationType.typeOf };

type Apply = { type: OperationType.apply; argArray: any[] };
type Construct = { type: OperationType.construct; argArray: any[] };
type DefineProperty = {
    type: OperationType.defineProperty;
    property: string | number;
    attributes: PropertyDescriptor;
};
type DeleteProperty = {
    type: OperationType.deleteProperty;
    property: string | number;
};
type Get = { type: OperationType.get; property: string };
type GetOwnPropertyDescriptor = {
    type: OperationType.getOwnPropertyDescriptor;
    property: string | number;
};
type GetPrototypeOf = {
    type: OperationType.getPrototypeOf;
};
type Has = {
    type: OperationType.has;
    property: string;
};
type IsExtensible = {
    type: OperationType.isExtensible;
};
type OwnKeys = {
    type: OperationType.ownKeys;
};
type PreventExtensions = {
    type: OperationType.preventExtensions;
};
type Set = {
    type: OperationType.set;
    property: string | number;
    newValue: any;
};
type SetPrototypeOf = {
    type: OperationType.setPrototypeOf;
    prototype: any;
};
