import { isObject } from '../utils/is-object';
import { MessageNameSpace } from '../utils/const';

/**
 * A channel interface that connects two different JavaScript runtime environments, including a set of message sending and receiving methods such as postMessage/onmessage.
 * 连接两个不同 JS 运行环境的信道接口，包含 postMessage/onmessage 这样的一组收发消息的方法。
 */
export type Channel = {
    onmessage?: ((ev: any) => any) | null | undefined;
    postMessage: (message: any) => void;
};

const ChannelId = 'channelId';

export function message2Data<D extends { type: string } = never>(
    msg: any,
    type: D['type'],
    id: string | number | null | undefined,
): D | null {
    const data = msg?.[MessageNameSpace] || msg?.data?.[MessageNameSpace];
    if (!isObject(data) || data.type !== type || data[ChannelId] !== id) return null;
    return data;
}

export function data2Message<T extends {} = never>(data: T, id: string | number | null | undefined) {
    return {
        [MessageNameSpace]: Object.assign(data, { [ChannelId]: id }),
    };
}

export type CommitData = {
    type: 'commit';
    commitId: string;
    // 调用队列
    invokeQueue: any[];
    // 返回值
    return: any;
};

export interface ResultData {
    type: 'result';
    commitId: string;
    // 执行结果
    result: 'success' | 'failure';
    // 成功时的返回值
    return: any;
    // 失败时抛出的错误
    throw: any;
}
