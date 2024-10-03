# 序列化相关问题 {#serialization-issues}

## 优先使用原生接口进行序列化 {#prefer-using-native-interfaces-for-serialization}

信道模块不负责消息的序列化工作。在 `commit` 方法内部发出调用信息时，传递给信道实例 `postMessage` 方法的是包含调用栈的 JS 对象。

如果你期望连接的不同 JS
运行环境的原生通信接口已经实现了[结构化克隆算法](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
，那么应该优先选择将原生通信接口作为信道。
这样在大多数情况下，就无需过多关注序列化问题。

::: tip 提示
如果原生通信接口的消息发送方法名为 `postMessage`，那么它很可能已经支持结构化克隆算法。
:::

## 推荐的序列化方案 {#recommended-serialization-solutions}

然而，在某些场景下，你仍然可能会面临序列化问题，包括:

-   需要序列化函数的场景。
-   WebSocket 等仅支持收发字符串消息的场景。

这里推荐一组基于 JSON 的序列化方案:

| 库                                                                                                                        | 功能                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [json-serialization](https://github.com/memo-cn/json-serialization/blob/main/packages/json/README.zh-CN.md)               | 一个异步 JSON 序列化库，自动处理循环引用关系，支持扩展自定义序列化规则。                                      |
| [@json-serialization/binary](https://github.com/memo-cn/json-serialization/blob/main/packages/binary/README.zh-CN.md)     | 提供了二进制序列化和反序列化的机制，支持 `ArrayBuffer`、`Buffer`、`Blob`、`File`、`Uint8Array` 这些数据类型。 |
| [@json-serialization/function](https://github.com/memo-cn/json-serialization/blob/main/packages/function/README.zh-CN.md) | 提供了函数序列化和反序列化的机制，能够在不使用 `eval` 的情况下实现函数的跨上下文调用。                        |

这些库不仅适用于信道模块，也可以用于其他场景。

## 安装和使用示例 {#installation-and-usage-example}

```bash
npm i json-serialization
npm i @json-serialization/binary
npm i @json-serialization/function
```

示例代码展示了如何将仅支持收发字符串消息的基础信道封装为支持收发更多类型消息的信道。

```ts
import { parse, stringify } from 'json-serialization';
import { createFunctionSerDes } from '@json-serialization/function';
import { binarySerializer, binaryDeserializer } from '@json-serialization/binary';

var basicChannel: {
    onmessage?: (data: string) => void;
    postMessage: (data: string) => void;
};

var channel: {
    onmessage?: (data: any) => void;
    postMessage: (data: any) => void;
} = {
    async postMessage(data: any) {
        basicChannel.postMessage(
            await stringify(data, [functionSerDes.serializer, binarySerializer]),
        );
    },
};

basicChannel.onmessage = async (data: string) => {
    channel?.onmessage?.(
        await parse(data, [functionSerDes.deserializer, binaryDeserializer]),
    );
};

var functionSerDes = createFunctionSerDes(channel);
```
