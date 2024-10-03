# Quick Start

## Creating Channels {#creating-channels}

To use the channel module, you need to create or find a channel interface that connects two different JS runtime
environments, typically a pair of methods like `postMessage`/`onmessage` or `send`/`on` for sending and receiving
messages.

If the runtime environments are same-origin, the simplest way is to create
a [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) as the channel.

```js
var channel = new BroadcastChannel();
```

In the chapter [Creating Channels in Various Scenarios](./creating-channels-in-various-scenarios.md), I will list more
channels, including common scenarios like Worker and WebSocket.

## Exporting Objects {#exporting-objects}

After creating the channel, you can export any JS object to the channel using the `Export` method provided by
the `channel-module`.

```js
import { Export } from 'channel-module';

Export(window, channel);
```

In the example code, the `window` object is exported to the channel.

## Importing Modules {#importing-modules}

Then, in another runtime environment, you can import the channel module from the channel using the `Import` method
provided by the `channel-module`, corresponding to the JS object exported from the other runtime environment.

```js
import { Import } from 'channel-module';

var otherWindow = Import(channel);
```

If you are using TypeScript, you can specify a generic parameter to indicate the type of the JS object exported from the
other runtime environment, so that the editor can provide full code highlighting.

```ts
import { Export } from 'channel-module';

var otherWindow = Import<Window>(channel);
// or
var otherWindow = Import(channel) as Window;
```

## Calling Modules {#calling-modules}

::: tip Preparation

The example code is also included in this document page you are reading.

Now, please <button class="channel-module" onclick="window.openNewWindow()">click here to open</button> a new window of
the current page. These two same-origin windows will export their `window` objects to the broadcast channel and import
the `otherWindow` channel module from the broadcast channel, corresponding to the `window` object exported by the other
window.

Next, I will use this as an example to demonstrate the cross-JS runtime environment module calling capability provided
by the channel module directly in your browser. Please do not close the newly opened window for now.

You can edit the code provided in the input box of the following document and click the run button to test. The
attributes or methods like `channel`, `otherWindow`, `commit`, `set` in the example can also be accessed globally, so
you can directly call and test them in the browser console.

:::

### Reading Properties {#reading-properties}

The example code reads the `innerWidth` property of the `otherWindow` channel module, corresponding to the `innerWidth`
property of the `window` object exported in another window, i.e., the width of the other window.

```js
import { commit } from 'channel-module';

await commit(otherWindow.innerWidth);
```

Try adjusting the width of the other window, then run the following code. The current page should pop up with the new
width.

<CodeInput code="'The width of the other window is: ' + await commit(otherWindow.innerWidth)" />

::: info Calling Principle

-   When a runtime environment calls the imported channel module, it sends the call information through the
    channel's `postMessage` interface, a process called commit.
-   When another runtime environment receives the call instruction from the channel's `onmessage` interface, it replays
    it, i.e., applies it to the exported JS object, and then returns the execution result through the channel.
    :::

### Setting Properties {#setting-properties}

Due to JS syntax limitations, setting properties needs to be done through the `set` method provided by
the `channel-module`.

```js
import { set } from 'channel-module';

commit(set(otherWindow.document.body.style.backgroundColor, 'red'));
```

After running the example code, the background color of the other window should be changed to red.

<CodeInput :alert="false" code="commit(set(otherWindow.document.body.style.backgroundColor, 'red'));" />

Try changing the `red` in the code to `blue` or any other color you like, then click the run button, and the background
color of the other window should change accordingly.

::: info Call Stack
The imported channel module is actually a `Proxy` used to record the call stack. The `commit` method internally sends
the call stack through the channel interface to another runtime environment.
:::

The call stack of the example code is as follows:

```json
[
  {
    "type": "get",
    "property": "document"
  },
  {
    "type": "get",
    "property": "body"
  },
  {
    "type": "get",
    "property": "style"
  },
  {
    "type": "set",
    "property": "backgroundColor",
    "newValue": "red"
  }
]
```

::: info Call Replay
Another window receives the call stack and applies it to the exported JS object.
:::

The JS code execution stack corresponding to the example call stack can be understood as:

```js
var result = window;
result = result['document'];
result = result['body'];
result = result['style'];
result['backgroundColor'] = 'red';
```

At this point, you have understood the core principles of the channel module.

### Calling Functions {#calling-functions}

After running the example code, another window will pop up an input box. Please switch to that window and enter any
content, and after clicking Confirm, the current window will display that content.

```js
await commit(otherWindow.prompt('input:'));
```

<CodeInput code="'In another window, you entered: ' + await commit(otherWindow.prompt('input:'))" />
