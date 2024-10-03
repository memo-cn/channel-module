# API 参考

### 信道（Channel）{#channel}

```ts
type Channel = {
    onmessage?: ((ev: any) => any) | null;
    postMessage: (message: any) => void;
};
```

### 导出（Export）{#export}

```ts
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
declare function Export<T>(module: T, channel: Channel): T;
```

### 导入（Import）{#import}

```ts
/**
 * @desc
 *   Import a module from the channel
 *   从信道导入模块
 *
 * @param channel
 *   The channel used internally for transmitting call messages
 *   内部用于传输调用消息的信道
 *
 * @returns
 *   The imported module, which is actually a Proxy
 *   导入的模块, 实际上是一个 Proxy
 */
declare function Import<T>(channel: Channel): T;
```

### 提交（Commit）{#commit}

```ts
/**
 * @desc
 *   Commit the recorded operations.
 *   提交记录的操作
 *
 * @param proxy
 *   The proxy object containing recorded operations.
 *   代理对象，包含了记录的操作
 *
 * @param commitOptions {CommitOptions}
 *   Commit options
 *   提交选项
 *
 * @returns
 *   The result of replaying the operations.
 *   操作回放的结果
 */
declare function commit<T, O extends CommitOptions>(proxy: T, commitOptions?: O): Promise<O['omitReturn'] extends true ? void : Awaited<T>>;

/**
 * Commit options 提交选项
 */
type CommitOptions = {
    /**
     * Omit the return value, default is false
     * 忽略返回值，默认为 false
     */
    omitReturn: boolean;
};
```
