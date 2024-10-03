# 更多场景下的信道创建

## 广播频道（BroadcastChannel） {#broadcast-channel}

在 [快速开始](./quick-start.md)
章节，介绍了两个同源窗口可以创建[广播频道](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel)
作为信道，实现信道模块的相互调用。

```js
var channel = new BroadcastChannel();
```

接下来，我将继续列举一些常见的例子，展示如何在更多场景中获取或创建信道，以支持信道模块的通信。

## 工作线程（Worker）{#worker}

在主线程内，可以使用 [Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker) 实例作为与工作线程通信的信道。

```js
var channel = new Worker('worker.js');
```

在 Worker 线程内，可以使用 `self` 属性作为与主线程通信的信道。

```js
var channel = self;
```

## 内嵌窗口（Iframe）{#iframe}

在父窗口内，可以通过 [HTMLIFrameElement.contentWindow](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLIFrameElement/contentWindow)
属性获取内嵌窗口的引用，并创建信道。

```typescript
var iframe = document.querySelector('iframe');
var channel = {
    postMessage(data) {
        iframe.contentWindow?.postMessage?.(data, '*');
    },
};
self.addEventListener('message', function(ev) {
    if (ev.source === iframe.contentWindow) {
        channel?.onmessage?.(ev);
    }
});
```

在内嵌窗口里，可以通过 `parent` 属性获取父窗口的引用，从而创建信道。

```typescript
var channel = {
    postMessage(data) {
        parent.postMessage(data, '*');
    },
};
self.addEventListener('message', function(ev) {
    channel?.onmessage?.(ev);
});
```

## 后台脚本（Background scripts）{#background-scripts}

在内容脚本里，可以使用 [chrome.runtime.connect](https://developer.chrome.com/docs/extensions/reference/runtime/#method-connect)
方法连接后台脚本，并从返回的 `port` 对象创建出信道。

```javascript
var port = chrome.runtime.connect();
var channel = {
    postMessage(data) {
        port.postMessage(data);
    },
};
port.onMessage.addListener(function(data, port) {
    channel?.onmessage?.(data);
});
```

在后台脚本内，可以通过 [chrome.runtime.onConnect](https://developer.chrome.com/docs/extensions/reference/runtime/#event-onConnect)
事件监听器接收内容脚本的连接请求，同样从 `port` 对象创建出信道。

```javascript
chrome.runtime.onConnect.addListener(function(port) {
    var channel = {
        postMessage(data) {
            port.postMessage(data);
        },
    };
    port.onMessage.addListener(function(data, port) {
        channel?.onmessage?.(data);
    });
});
```

::: tip 提示
如果你比较细心，可能会留意到原生的 `onmessage` 的回调参数有的是包含了 `data`
属性的 [MessageEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageEvent) 对象，而有的则是普通的消息值。

信道模块内部做了兼容，同时支持这两类数据结构。
:::

## 进程间通信（IPC）{#ipc}

在父进程内，可以通过 [spawn](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) 方法创建子进程，并将
`stdio` 数组的第 4 个参数指定为 `'ipc'`。

```js
var childProcess = spawn('node', ['child.js'], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
});
```

然后，从子进程的引用对象创建出信道。

```js
var channel = {
    postMessage(data) {
        childProcess.send(data);
    },
};
childProcess.on('message', function(data) {
    channel?.onmessage?.(data);
});
```

在子进程内，可以从 `process` 对象创建出信道。

```js
var channel = {
    postMessage(data) {
        process.send(data);
    },
};
process.on('message', function(data) {
    channel?.onmessage?.(data);
});
```

## 网络套接字（WebSocket）{#websocket}

当两个 JS
运行环境需要通过网络进行通信时，可以使用 [WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 作为信道。

信道模块底层发送的消息包含两类数据: 一类是调用栈中由调用者决定的参数，另一类是信道模块自身维护的其他属性。后者能保证可以被 `JSON.stringify` 方法序列化，也能被结构化克隆算法处理。

由于 WebSocket 未提供支持结构化克隆算法的 `postMessage` 方法，你可能需要自行设计序列化和反序列化算法，并确保序列化后的数据能够作为
WebSocket 实例上 `send` 方法的参数。

不过，在大多数情况下，如果你能保证调用栈包含的参数可以被 `JSON.stringify` 方法序列化为字符串，那么可以参考下面的示例代码，从
WebSocket 实例创建出信道。

```typescript
var channel = {
    postMessage(data) {
        webSocket.send(JSON.stringify(data));
    },
};
webSocket.onmessage = function(ev) {
    channel?.onmessage?.({
        data: JSON.parse(ev.data),
    });
};
```
