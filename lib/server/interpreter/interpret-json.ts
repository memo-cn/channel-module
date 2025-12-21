import { isObject } from '../../utils/is-object';
import { interpretOperations } from './interpret-operations';
import { PermissionChecker } from '../../common/operation-permission';
import { operationsEncoder } from '../../common/operationsEncoder';

// 解释 json: 将 json 中的操作链解释替换为调用结果, 原对象会被修改
export function interpretJson<T>({
    json,
    rootCtx,
    permissionChecker,
}: {
    json: T;
    rootCtx: any;
    permissionChecker: PermissionChecker;
}): Promise<T> {
    // 缓存操作链到调用结果的映射
    const operationIdToResult = new Map<string, any>();

    // 用于存储值到引用值或解释值的映射，用于恢复引用关系
    const valueToNewValue = new WeakMap<any, any>();

    return traverse(json);

    async function traverse(value: any): Promise<any> {
        if (!isObject(value)) {
            return value;
        }

        // 恢复引用关系
        if (valueToNewValue.has(value)) {
            return valueToNewValue.get(value);
        }

        const originalValue = value;

        // 遍历对象
        for (let [key, oldValue] of Object.entries(value)) {
            const newValue = await traverse(oldValue);
            if (!Object.is(newValue, oldValue)) {
                value[key] = newValue;
            }
        }

        // 需要在上面完成遍历, 因为操作的参数也可能包含操作

        const oldValue = value;
        value = operationsEncoder.decode(value);
        if (oldValue !== value) {
            // 如果为操作链, 进行解释
            value = await interpretOperations({ operations: value, rootCtx, operationIdToResult, permissionChecker });
        }

        valueToNewValue.set(originalValue, value);
        return value;
    }
}
