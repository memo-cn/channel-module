import { isObject } from '../../utils/is-object';
import { operationsToJson } from '../../common/operation';
import { proxyToState } from './basic-constructor';

// 将包含 Proxy 的对象转换为 json 对象, 原对象不会被修改
export function transformProxyToJson<T = any>(obj: T): T {
    const originalToNew = new Map<any, any>();

    return transform(obj);

    function transform(current: any): any {
        // 如果原始值已经处理过，直接返回
        if (originalToNew.has(current)) {
            return originalToNew.get(current);
        }

        // 如果值不是对象或数组，直接返回原值
        if (!isObject(current)) return current;

        const original = current;

        // 如果当前值为 proxy
        const state = proxyToState.get(current);
        if (state) {
            // 转换为 json
            current = operationsToJson(state.operations);

            // 现在不能直接返回, 因为它有可能包含其他操作链, 因此还需要继续往下处理
        }

        // 初始化克隆对象或数组
        let clone: any;
        // 是否包含循环引用
        let containsCircularReference = false;
        if (Array.isArray(current)) {
            clone = [];
        } else if (Reflect.getPrototypeOf(current) === Object.prototype) {
            clone = {};
        } else {
            clone = current;
        }

        // 遍历原始值的每个属性，递归克隆
        if (clone !== current) {
            for (const [key, oldValue] of Object.entries(current)) {
                const newValue = transform(oldValue);
                clone[key] = newValue;
                if (!Object.is(oldValue, newValue)) {
                    containsCircularReference = true;
                }
            }
        }

        const ret = containsCircularReference ? clone : current;

        // 将原始值和克隆值（或其自身）的映射存储到 Map 中，后续直接返回
        originalToNew.set(original, ret);

        return ret;
    }
}
