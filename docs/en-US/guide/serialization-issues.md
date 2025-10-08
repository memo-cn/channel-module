# Serialization Issues {#serialization-issues}

## Prefer Using Native Interfaces for Serialization {#prefer-using-native-interfaces-for-serialization}

The channel module does not handle message serialization. When calling the `commit` method, the information passed to the channel instance's `postMessage` method is a JS object containing the call stack.

If you expect the native communication interfaces of different JS runtime environments to have implemented the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), you should prefer using the native communication interface as the channel. This way, in most cases, you don't need to worry too much about serialization issues.

::: tip
If the message sending method of the native communication interface is named `postMessage`, it is likely that it already supports the structured clone algorithm.
:::

## Recommended Serialization Solutions {#recommended-serialization-solutions}

However, in some scenarios, you may still face serialization issues, including:

- Scenarios where functions need to be serialized.
- Scenarios like WebSocket that only support sending and receiving string messages.

Here is a set of JSON-based serialization solutions:

| Library                                                                                                             | Functionality                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [json-serialization](https://github.com/memo-cn/json-serialization/blob/main/packages/json/README.md)               | An asynchronous JSON serialization library that automatically handles circular references and supports custom serialization rules.              |
| [@json-serialization/binary](https://github.com/memo-cn/json-serialization/blob/main/packages/binary/README.md)     | Provides binary serialization and deserialization mechanisms, supporting data types like `ArrayBuffer`, `Buffer`, `Blob`, `File`, `Uint8Array`. |
| [@json-serialization/error](https://github.com/memo-cn/json-serialization/blob/main/packages/error/README.md)       | Provides a serialization and deserialization mechanism for `Error` and its subclasses.                                                          |
| [@json-serialization/function](https://github.com/memo-cn/json-serialization/blob/main/packages/function/README.md) | Provides function serialization and deserialization mechanisms, enabling cross-context function calls without using `eval`.                     |

These libraries are not only suitable for the channel module but can also be used in other scenarios.

## Installation and Usage Example {#installation-and-usage-example}

```ts
<!--@include: ../../snippets/guide/install.sh-->
```

The example code demonstrates how to wrap a basic channel that only supports sending and receiving string messages into a channel that supports sending and receiving more types of messages.

```ts
<!--@include: ../../snippets/guide/use.ts-->
```
