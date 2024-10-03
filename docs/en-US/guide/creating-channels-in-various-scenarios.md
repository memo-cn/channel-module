# Creating Channels in Various Scenarios

## BroadcastChannel {#broadcast-channel}

In the [Quick Start](./quick-start.md) chapter, I introduced that two same-origin windows can create a [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) to serve as a channel to enable mutual calls of channel modules.

```js
var channel = new BroadcastChannel();
```

Next, I will continue to list some common examples to show how to obtain or create channels in more scenarios to support the communication of channel modules.

## Worker {#worker}

In the main thread, a [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) instance can be used as a channel to communicate with the worker thread.

```js
var channel = new Worker('worker.js');
```

In the worker thread, the `self` property can be used as a channel to communicate with the main thread.

```js
var channel = self;
```

## Iframe {#iframe}

In the parent window, you can get a reference to the embedded window through the [HTMLIFrameElement.contentWindow](https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow) property and create a channel.

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

In the embedded window, you can get a reference to the parent window through the `parent` property to create a channel.

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

## Background scripts {#background-scripts}

In the content script, you can use the [chrome.runtime.connect](https://developer.chrome.com/docs/extensions/reference/runtime/#method-connect) method to connect to the background script and create a channel from the returned `port` object.

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

In the background script, you can receive connection requests from the content script through the [chrome.runtime.onConnect](https://developer.chrome.com/docs/extensions/reference/runtime/#event-onConnect) event listener and create a channel from the `port` object.

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

::: tip

If you are observant, you may notice that the native `onmessage` callback parameter is sometimes a [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent) object containing a `data` property, and sometimes just a plain message value.

The channel module internally handles both types of data structures.

:::

## Inter-Process Communication (IPC) {#ipc}

In the parent process, you can create a child process through the [spawn](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) method and specify `'ipc'` as the 4th parameter of the `stdio` array.

```js
var childProcess = spawn('node', ['child.js'], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
});
```

Then, create a channel from the child `process` reference object.

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

In the child process, you can create a channel from the `process` object.

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

## WebSocket {#websocket}

When two JS runtime environments need to communicate over the network, a [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) can be used as a channel.

The messages sent by the channel module contain two types of data: one type is the parameters determined by the caller in the call stack, and the other is other properties maintained by the channel module itself. The latter can be serialized by the `JSON.stringify` method and handled by the structured clone algorithm.

Since WebSocket does not provide a `postMessage` method that supports the structured clone algorithm, you may need to design your own serialization and deserialization algorithms and ensure that the serialized data can be used as a parameter for the `send` method on the WebSocket instance.

However, in most cases, if you can ensure that the parameters in the call stack can be serialized into a string by the `JSON.stringify` method, you can refer to the following example code to create a channel from the WebSocket instance.

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
