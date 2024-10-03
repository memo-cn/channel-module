# 快速开始

## 创建信道 {#creating-channels}

使用信道模块的前提是创建或找到连接两个不同 JS 运行环境的信道接口，通常是 `postMessage`/`onmessage` 或 `send`/`on`
这样的一组收发消息的方法。

如果运行环境是同源的，那么最简单的方式就是创建[广播频道](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel)
作为信道。

```js
var channel = new BroadcastChannel();
```

在[更多场景下的信道创建](./creating-channels-in-various-scenarios.md)章节中，我会列举更多信道，包括 Worker、WebSocket
等常见场景。

## 导出对象 {#exporting-objects}

创建信道后，可以通过 `channel-module` 提供的 `Export` 方法，将任意 JS 对象导出到信道。

```js
import { Export } from 'channel-module';

Export(window, channel);
```

在示例代码中，`window` 对象被导出到了信道。

## 导入模块 {#importing-modules}

之后可以在另一个运行环境中，通过 `channel-module` 提供的 `Import` 方法，从信道导入信道模块，对应在另一个运行环境中导出的 JS 对象。

```js
import { Import } from 'channel-module';

var otherWindow = Import(channel);
```

如果你使用 TypeScript，可以指定一个泛型参数，表示从另一个运行环境中导出的 JS 对象的类型，以便编辑器提供完整的代码高亮提示。

```ts
import { Export } from 'channel-module';

var otherWindow = Import<Window>(channel);
// or
var otherWindow = Import(channel) as Window;
```

## 调用模块 {#calling-modules}

::: tip 准备工作

示例代码也被加入到了你正在阅读的这个文档页面。

现在，请 <button class="channel-module" onclick="window.openNewWindow()">点击此处新开</button>
一个当前页面的窗口。那么，这两个同源的窗口就相互将自身的 `window`
对象导出到了广播信道，也相互从广播信道导入了 `otherWindow` 这个信道模块，与对方窗口导出的 `window` 对象对应。

接下来，我将以此为例，直接在你的浏览器中演示信道模块为这两个窗口提供的跨 JS 运行环境的模块调用能力，请暂时不要关闭新打开的窗口。

你可以编辑接下来的文档提供的输入框内的代码，并点击运行按钮进行测试。示例中的 `channel`、`otherWindow`、`commit`、`set`
这些属性或方法也可以在全局访问，因此你可以直接打开浏览器的控制台，对它们进行调用和测试。

:::

### 读取属性 {#reading-properties}

示例代码读取了 `otherWindow` 这个信道模块的 `innerWidth` 属性，对应在另一个窗口导出的 `window` 对象的 `innerWidth`
属性，即另一个窗口的宽度。

```js
import { commit } from 'channel-module';

await commit(otherWindow.innerWidth);
```

尝试调整另一个窗口的宽度，然后运行下面的代码。当前页面应该会弹窗提示新的宽度。

<CodeInput code="'The width of the other window is: ' + await commit(otherWindow.innerWidth)" />

::: info 调用原理

-   在一个运行环境对导入的信道模块进行调用后，通过信道的 `postMessage` 接口发出调用信息，这个过程称为提交（commit）。
-   在另一个运行环境从信道的 `onmessage` 接口接收到调用指令后，将其回放，即应用到导出的 JS 对象上，再通过信道传回执行结果。

:::

### 赋值属性 {#setting-properties}

由于 JS 语法限制，属性赋值需要通过 `channel-module` 提供的 `set` 方法来实现。

```js
import { set } from 'channel-module';

commit(set(otherWindow.document.body.style.backgroundColor, 'red'));
```

运行示例代码后，另一个窗口的背景颜色应该会被修改为红色。

<CodeInput :alert="false" code="commit(set(otherWindow.document.body.style.backgroundColor, 'red'));" />

尝试将代码中的 `red` 修改为 `blue` 或其他你喜欢的颜色，然后点击运行按钮，另一个窗口的背景颜色应该也会相应地修改。

::: info 调用栈
导入的信道模块实际上是一个 `Proxy`，用于记录调用栈。`commit` 方法内部会将调用栈通过信道接口发送到另一个运行环境。
:::

示例代码的调用栈如下:

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

::: info 调用回放
另一个窗口接收到调用栈后，将其应用到导出的 JS 对象上。
:::

示例调用栈对应的 JS 代码执行栈可以理解为:

```js
var result = window;
result = result['document'];
result = result['body'];
result = result['style'];
result['backgroundColor'] = 'red';
```

至此，你已经了解了信道模块的核心原理。

### 调用函数 {#calling-functions}

运行示例代码后，另一个窗口会弹出一个输入框。请切换到该窗口并输入任意内容，点击确定后，当前窗口将显示该内容。

```js
await commit(otherWindow.prompt('input:'));
```

<CodeInput code="'In another window, you entered: ' + await commit(otherWindow.prompt('input:'))" />
