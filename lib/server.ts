import { Channel, type CommitData, data2Message, message2Data, type ResultData } from './message';
import { Operation, OperationType } from './operation';
import { serializeError } from './error-serializer';

/**
 * @desc
 *   Export a module to the channel
 *   将模块导出到信道
 *
 * @param module
 *   The module to be exported
 *   导出的模块
 *
 * @param channel
 *   The channel used internally for transmitting call messages
 *   内部用于传输调用消息的信道
 *
 * @returns module
 *   The module parameter passed in
 *   传入的 module 参数
 */
export function Export<T>(module: T, channel: Channel): T {
    const originalOnMessage = typeof channel.onmessage === 'function' ? channel.onmessage : null;
    channel.onmessage = async function (...args: any[]) {
        // 如果原来存在监听器, 对其进行调用。
        if (originalOnMessage) {
            setTimeout(() => {
                Reflect.apply(originalOnMessage, channel, args);
            });
        }
        const commitData = message2Data<CommitData>(args[0], 'commit');
        if (commitData) {
            let result: ResultData['result'] = 'success';
            let throw_, return_;
            try {
                return_ = await parseOperations(commitData.operations);
                if (commitData.omitReturn) {
                    return_ = void 0;
                }
            } catch (e) {
                throw_ = e;
                result = 'failure';
            }

            channel.postMessage(
                data2Message<ResultData>({
                    type: 'result',
                    commitId: commitData.commitId,
                    result,
                    return: return_,
                    throw: serializeError(throw_),
                }),
            );
        }
    };

    return module;

    async function parseOperations(operations: Operation[]) {
        // 当前的计算结果
        let res: any = module;
        // 最近几次 get 的结果
        const recentRes: any[] = [res];
        for (let i = 0; i < operations.length; i++) {
            const op = operations[i];
            // console.log(op.type, op);
            switch (op.type) {
                case OperationType.apply: {
                    const thisArgument = recentRes.length >= 2 ? recentRes[recentRes.length - 2] : null;
                    res = Reflect.apply(res, thisArgument, op.argArray);
                    break;
                }
                case OperationType.construct: {
                    res = Reflect.construct(res, op.argArray);
                    break;
                }
                case OperationType.defineProperty: {
                    res = Object.defineProperty(res, op.property, op.attributes);
                    break;
                }
                case OperationType.deleteProperty: {
                    res = delete res[op.property];
                    break;
                }
                case OperationType.get: {
                    res = res[op.property];
                    break;
                }
                case OperationType.getOwnPropertyDescriptor: {
                    res = Object.getOwnPropertyDescriptor(res, op.property);
                    break;
                }
                case OperationType.getPrototypeOf: {
                    res = Object.getPrototypeOf(res);
                    break;
                }
                case OperationType.has: {
                    res = op.property in res;
                    break;
                }
                case OperationType.isExtensible: {
                    res = Object.isExtensible(res);
                    break;
                }
                case OperationType.ownKeys: {
                    res = Object.getOwnPropertyNames(res);
                    break;
                }
                case OperationType.preventExtensions: {
                    res = Object.preventExtensions(res);
                    break;
                }
                case OperationType.set: {
                    res = res[op.property] = op.newValue;
                    break;
                }
                case OperationType.setPrototypeOf: {
                    res = Object.setPrototypeOf(res, op.prototype);
                    break;
                }
                case OperationType.boolean: {
                    res = Boolean(res);
                    break;
                }
                case OperationType.optional: {
                    if (res === null || res === void 0) {
                        return void 0;
                    }
                    break;
                }
                case OperationType.typeOf: {
                    res = typeof res;
                    break;
                }
            }
            res = await res;
            recentRes.push(res);
            if (recentRes.length > 2) {
                recentRes.shift();
            }
        }
        return res;
    }
}
