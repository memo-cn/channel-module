import { OperationType } from './operation';
import { stringifyValue } from '../utils/stringify-value';

/**
 * 模块操作权限类型
 * Module operation permission type
 */
export type OperationPermission =
    /**
     * 授予全部权限
     * Grant all permissions
     */
    | 'all'
    /**
     * 基础操作类型权限
     * Basic operation type permissions
     */
    | OperationType
    /**
     * 允许访问原型链上的属性（默认情况下，只允许访问对象自身的属性）
     * Allow access to properties on the prototype chain (by default, only allows access to the object's own properties)
     */
    | 'accessPrototypeProperty'
    /**
     *  允许访问函数上的属性（默认情况下，只允许调用函数，不允许访问其属性）
     *  Allow access to properties on functions (by default, only allows calling functions, not accessing their properties)
     */
    | 'accessFunctionProperty';

export type PermissionChecker = {
    hasPermission: (permission: OperationPermission) => boolean;
    missingMsg: (permission: OperationPermission) => string;
};

function missingMsg(permission: OperationPermission) {
    return ' ' + `due to missing ${stringifyValue(permission)} permission`;
}

export function createOperationPermissionChecker(permissions?: OperationPermission[] | 'all'): PermissionChecker {
    if (permissions === 'all') {
        permissions = ['all'];
    }

    const set = new Set<OperationPermission>();
    if (Array.isArray(permissions)) {
        for (let permission of permissions) {
            if (permission === 'all') {
                return {
                    hasPermission: () => true,
                    missingMsg,
                };
            }
            set.add(permission);
        }
    } else {
        set.add(OperationType.apply);
        set.add(OperationType.get);
        set.add(OperationType.await);
        set.add(OperationType.boolean);
        set.add(OperationType.optional);
        set.add(OperationType.typeOf);
    }

    return { hasPermission: (permission) => set.has(permission), missingMsg };
}
