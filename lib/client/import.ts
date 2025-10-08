import { Channel, type CommitData, data2Message, message2Data, type ResultData } from '../common/message';
import { transformProxyToJson } from './proxy/serializer';
import { uuid } from '../utils/uuid';
import { createProxy } from './proxy/basic-constructor';
import { checkAndAddId } from '../common/check-and-add-id';

/**
 * Imported channel module, which provides the commit method for recording and submitting invocation information
 * 导入的信道模块，提供了 commit 方法，用于记录和提交调用信息
 */
export type ChannelModule<Module = any> = {
    /**
     * @desc
     *   Record and submit invocation information
     *   记录并提交调用信息
     *
     * @param recorder
     *   The recorder function. The input parameter is a proxy that can be invoked. Operations performed on this proxy will be sent to the context of the exported module for interpretation.
     *   记录器函数。输入参数是一个可以被调用的代理。对该代理执行的操作将被发送到导出模块的上下文进行解释。
     *
     * @returns
     *   The result obtained after sending the operations on the proxy to the module's export side for interpretation.
     *   对代理的操作发送到模块导出端进行解释后得到的结果
     */
    commit: <Recorder extends (module: Module) => any = (module: Module) => any>(
        recorder: Recorder,
    ) => Promise<ReturnType<Recorder>>;
};

/**
 * @desc
 *   Import a module from the channel
 *   从信道导入模块
 *
 * @param channel
 *   The channel used internally for transmitting call messages
 *   内部用于传输调用消息的信道
 *
 * @param id
 *   When reusing a channel for importing, please specify a distinct id. It should match the id used during exporting.
 *   当复用信道进行导入时，请指定一个不同的 id。该 id 应与导出时使用的 id 相匹配。
 *
 * @returns ChannelModule
 *   Imported channel module, which provides the commit method for recording and submitting invocation information
 *   导入的信道模块，提供了 commit 方法，用于记录和提交调用信息
 */
export function Import<Module = any>({
    channel,
    id,
}: {
    channel: Channel;
    id?: string | number | null | undefined;
}): ChannelModule<Module> {
    checkAndAddId(channel, id, 'importing');

    const commitId2Callback = new Map<string, { resolve: any; reject: any }>();

    const originalOnMessage = typeof channel.onmessage === 'function' ? channel.onmessage : null;
    channel.onmessage = async function (...args: any[]) {
        // 如果原来存在监听器, 对其进行调用。
        if (originalOnMessage) {
            setTimeout(() => {
                Reflect.apply(originalOnMessage, channel, args);
            });
        }
        const resultData = message2Data<ResultData>(args[0], 'result', id);
        if (resultData) {
            const callback = commitId2Callback.get(resultData.commitId);
            if (callback) {
                commitId2Callback.delete(resultData.commitId);
                if (resultData.result === 'success') {
                    callback.resolve(resultData.return);
                } else {
                    callback.reject(resultData.throw);
                }
            }
        }
    };

    return {
        commit,
    };

    function commit<Recorder extends (module: Module) => any>(recorder: Recorder): Promise<ReturnType<Recorder>> {
        // 调用队列
        const invokeQueue: any[] = [];

        // 记录调用信息
        const return_ = recorder(createProxy([], { invokeQueue }));

        // 转换为 json
        const json = transformProxyToJson({
            return_,
            invokeQueue,
        });

        // 返回调用结果
        return new Promise<Awaited<ReturnType<Recorder>>>((resolve, reject) => {
            const commitId = uuid();
            commitId2Callback.set(commitId, { resolve, reject });
            // 提交调用信息
            channel.postMessage(
                data2Message<CommitData>(
                    {
                        type: 'commit',
                        commitId,
                        invokeQueue: json.invokeQueue,
                        return: json.return_,
                    },
                    id,
                ),
            );
        });
    }
}
