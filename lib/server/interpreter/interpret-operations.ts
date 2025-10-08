import { Operation, OperationType } from '../../common/operation';
import { PermissionChecker } from '../../common/operation-permission';
import { stringifyValue } from '../../utils/stringify-value';

const ExitToken: unique symbol = {} as any;

// 获取字面量字符串, 用于报错时打印
function getLiteralString(operations: Operation[]) {
    let str = '$';
    for (let op of operations) {
        switch (op.type) {
            case OperationType.get:
            case OperationType.set: {
                const prop = String(op.property);
                const isNumeric = /^\d+$/.test(prop);
                const useBracket = prop === '' || prop.includes('.') || prop.includes(' ') || isNumeric;
                str += useBracket ? `[${isNumeric ? prop : stringifyValue(prop)}]` : `.${prop}`;
                break;
            }
            case OperationType.apply: {
                str += '(';
                if (op.argArray.length > 0) {
                    str += '...';
                }
                str += ')';
                break;
            }
            case OperationType.construct: {
                str = `new (${str})`;
                break;
            }
            default: {
                if (str[str.length - 1] !== ' ') {
                    str += ' ... ';
                }
            }
        }
    }
    return str;
}

// 解释操作链
export async function interpretOperations({
    operations,
    rootCtx,
    operationIdToResult,
    permissionChecker,
}: {
    operations: Operation[];
    rootCtx: any;
    operationIdToResult: Map<string, any>;
    permissionChecker: PermissionChecker;
}) {
    // 当前的计算结果
    let res = rootCtx;
    // 缓存最近几次的计算结果
    const recentRes: any[] = [res];
    for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        if (operationIdToResult.has(op.id)) {
            res = operationIdToResult.get(op.id);
        } else {
            function getCumulativeOpLiteral() {
                return getLiteralString(operations.slice(0, i));
            }
            // console.log(op.type, op);
            switch (op.type) {
                case OperationType.apply: {
                    if (!permissionChecker.hasPermission(OperationType.apply)) {
                        throw new TypeError(
                            `Cannot invoke ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.apply),
                        );
                    }
                    if (typeof res !== 'function') {
                        throw new TypeError(`${stringifyValue(res)} (${getCumulativeOpLiteral()}) is not a function`);
                    }
                    const thisArgument = recentRes.length >= 2 ? recentRes[recentRes.length - 2] : null;
                    res = Reflect.apply(res, thisArgument, op.argArray);
                    break;
                }
                case OperationType.construct: {
                    if (!permissionChecker.hasPermission(OperationType.construct)) {
                        throw new TypeError(
                            `Cannot instantiate ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.construct),
                        );
                    }
                    if (typeof res !== 'function') {
                        throw new TypeError(
                            `${stringifyValue(res)} (${getCumulativeOpLiteral()}) is not a constructor`,
                        );
                    }
                    res = Reflect.construct(res, op.argArray);
                    break;
                }
                case OperationType.defineProperty: {
                    if (!permissionChecker.hasPermission(OperationType.defineProperty)) {
                        throw new TypeError(
                            `Cannot define property ${stringifyValue(op.property)} on ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.defineProperty),
                        );
                    }
                    res = Object.defineProperty(res, op.property, op.attributes);
                    break;
                }
                case OperationType.deleteProperty: {
                    if (!permissionChecker.hasPermission(OperationType.deleteProperty)) {
                        throw new TypeError(
                            `Cannot delete property ${stringifyValue(op.property)} of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.deleteProperty),
                        );
                    }
                    res = delete res[op.property];
                    break;
                }
                case OperationType.get:
                case OperationType.set: {
                    let reason: string | undefined;
                    if (res === undefined || res === null) {
                        reason = '';
                    } else if (!permissionChecker.hasPermission(op.type)) {
                        reason = permissionChecker.missingMsg(op.type);
                    } else if (
                        !permissionChecker.hasPermission('accessFunctionProperty') &&
                        typeof res === 'function'
                    ) {
                        reason = permissionChecker.missingMsg('accessFunctionProperty');
                    } else if (
                        !permissionChecker.hasPermission('accessPrototypeProperty') &&
                        !Object.hasOwn(res, op.property) &&
                        op.property in Object.getPrototypeOf(res)
                    ) {
                        reason = permissionChecker.missingMsg('accessPrototypeProperty');
                    }
                    if (typeof reason === 'string') {
                        throw new TypeError(
                            `Cannot ${op.type === OperationType.set ? 'set' : 'read'} property ${stringifyValue(op.property)} of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                reason,
                        );
                    }
                    if (op.type === OperationType.set) {
                        res = res[op.property] = op.newValue;
                    } else if (op.type === OperationType.get) {
                        res = res[op.property];
                    }
                    break;
                }
                case OperationType.getOwnPropertyDescriptor: {
                    if (!permissionChecker.hasPermission(OperationType.getOwnPropertyDescriptor)) {
                        throw new TypeError(
                            `Cannot get descriptor for property ${stringifyValue(op.property)} of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.getOwnPropertyDescriptor),
                        );
                    }
                    res = Object.getOwnPropertyDescriptor(res, op.property);
                    break;
                }
                case OperationType.getPrototypeOf: {
                    if (!permissionChecker.hasPermission(OperationType.getPrototypeOf)) {
                        throw new TypeError(
                            `Cannot get prototype of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.getPrototypeOf),
                        );
                    }
                    res = Object.getPrototypeOf(res);
                    break;
                }
                case OperationType.has: {
                    if (!permissionChecker.hasPermission(OperationType.has)) {
                        throw new TypeError(
                            `Cannot check existence of property ${stringifyValue(op.property)} in ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.has),
                        );
                    }
                    res = op.property in res;
                    break;
                }
                case OperationType.isExtensible: {
                    if (!permissionChecker.hasPermission(OperationType.isExtensible)) {
                        throw new TypeError(
                            `Cannot check if ${stringifyValue(res)} (${getCumulativeOpLiteral()}) is extensible` +
                                permissionChecker.missingMsg(OperationType.isExtensible),
                        );
                    }
                    res = Object.isExtensible(res);
                    break;
                }
                case OperationType.ownKeys: {
                    if (!permissionChecker.hasPermission(OperationType.ownKeys)) {
                        throw new TypeError(
                            `Cannot get own keys of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.ownKeys),
                        );
                    }
                    res = Object.getOwnPropertyNames(res);
                    break;
                }
                case OperationType.preventExtensions: {
                    if (!permissionChecker.hasPermission(OperationType.preventExtensions)) {
                        throw new TypeError(
                            `Cannot prevent extensions of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.preventExtensions),
                        );
                    }
                    res = Object.preventExtensions(res);
                    break;
                }
                case OperationType.setPrototypeOf: {
                    if (!permissionChecker.hasPermission(OperationType.setPrototypeOf)) {
                        throw new TypeError(
                            `Cannot set prototype of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.setPrototypeOf),
                        );
                    }
                    res = Object.setPrototypeOf(res, op.prototype);
                    break;
                }
                case OperationType.boolean: {
                    if (!permissionChecker.hasPermission(OperationType.boolean)) {
                        throw new TypeError(
                            `Cannot convert ${stringifyValue(res)} (${getCumulativeOpLiteral()}) to boolean` +
                                permissionChecker.missingMsg(OperationType.boolean),
                        );
                    }
                    res = Boolean(res);
                    break;
                }
                case OperationType.optional: {
                    if (!permissionChecker.hasPermission(OperationType.optional)) {
                        throw new TypeError(
                            `Cannot perform optional chaining on ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.optional),
                        );
                    }
                    if (res === null || res === void 0) {
                        res = ExitToken;
                    }
                    break;
                }
                case OperationType.typeOf: {
                    if (!permissionChecker.hasPermission(OperationType.typeOf)) {
                        throw new TypeError(
                            `Cannot get type of ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.typeOf),
                        );
                    }
                    res = typeof res;
                    break;
                }
                case OperationType.await: {
                    if (!permissionChecker.hasPermission(OperationType.await)) {
                        throw new TypeError(
                            `Cannot await ${stringifyValue(res)} (${getCumulativeOpLiteral()})` +
                                permissionChecker.missingMsg(OperationType.await),
                        );
                    }
                    res = await res;
                    break;
                }
                default: {
                    throw new Error(`Unsupported operation type: ${(op as any).type}`);
                }
            }
            operationIdToResult.set(op.id, res);
        }

        if (res === ExitToken) {
            return void 0;
        }

        recentRes.push(res);
        // 更早的计算值可以移除, 因为暂时用不到
        if (recentRes.length > 2) {
            recentRes.shift();
        }
    }
    return res;
}
