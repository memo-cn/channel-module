import { Channel, type CommitData, data2Message, message2Data, type ResultData } from '../common/message';
import { interpretJson } from './interpreter/interpret-json';
import { checkAndAddId } from '../common/check-and-add-id';
import { createOperationPermissionChecker, OperationPermission } from '../common/operation-permission';

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
 *
 * @param id
 *   When reusing a channel for exporting, please specify a distinct id. It should match the id used during importing.
 *   当复用信道进行导出时，请指定一个不同的 id。该 id 应与导入时使用的 id 相匹配。
 *
 * @param permissions
 *   Specifies the operation permissions for the exported module. If this parameter is omitted, permissions for apply (function invocation), get (property access), await, boolean, optional, and typeOf are granted by default.
 *   设定对导出模块的操作权限。若省略此参数，默认授予 apply（函数调用）, get（属性访问）, await, boolean, optional, typeOf 权限。
 */
export function Export<T>({
    module,
    channel,
    id,
    permissions,
}: {
    module: T;
    channel: Channel;
    id?: string | number | null | undefined;
    permissions?: 'all' | OperationPermission[];
}): T {
    checkAndAddId(channel, id, 'exporting');
    const permissionChecker = createOperationPermissionChecker(permissions);

    const originalOnMessage = typeof channel.onmessage === 'function' ? channel.onmessage : null;
    channel.onmessage = async function (...args: any[]) {
        // 如果原来存在监听器, 对其进行调用。
        if (originalOnMessage) {
            setTimeout(() => {
                Reflect.apply(originalOnMessage, channel, args);
            });
        }
        const commitData = message2Data<CommitData>(args[0], 'commit', id);
        if (commitData) {
            let result: ResultData['result'] = 'success';
            let throw_: any, return_: any;
            try {
                const interpreted = await interpretJson({
                    json: {
                        return: commitData.return,
                        invokeQueue: commitData.invokeQueue,
                    },
                    rootCtx: module,
                    permissionChecker,
                });
                return_ = interpreted.return;
            } catch (e) {
                throw_ = e;
                result = 'failure';
            }

            const send = function send() {
                channel.postMessage(
                    data2Message<ResultData>(
                        {
                            type: 'result',
                            commitId: commitData!.commitId,
                            result,
                            return: return_,
                            throw: throw_,
                        },
                        id,
                    ),
                );
            };

            try {
                send();
            } catch (e) {
                result = 'failure';
                return_ = void 0;
                throw_ = e;
                send();
            }
        }
    };
    return module;
}
