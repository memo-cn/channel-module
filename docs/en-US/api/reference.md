# API Reference

### Channel {#channel}

```ts
type Channel = {
    onmessage?: ((ev: any) => any) | null;
    postMessage: (message: any) => void;
};
```

### Export {#export}

```ts
/**
 * @desc
 *   Export a module to the channel
 *
 * @param module
 *   The module to be exported
 *
 * @param channel
 *   The channel used internally for transmitting call messages
 *
 * @returns module
 *   The module parameter passed in
 */
declare function Export<T>(module: T, channel: Channel): T;
```

### Import {#import}

```ts
/**
 * @desc
 *   Import a module from the channel
 *
 * @param channel
 *   The channel used internally for transmitting call messages
 *
 * @returns
 *   The imported module, which is actually a Proxy
 */
declare function Import<T>(channel: Channel): T;
```

### Commit {#commit}

```ts
/**
 * @desc
 *   Commit the recorded operations.
 *
 * @param proxy
 *   The proxy object containing recorded operations.
 *
 * @param commitOptions {CommitOptions}
 *   Commit options
 *
 * @returns
 *   The result of replaying the operations.
 */
declare function commit<T, O extends CommitOptions>(proxy: T, commitOptions?: O): Promise<O['omitReturn'] extends true ? void : Awaited<T>>;

/**
 * Commit options
 */
type CommitOptions = {
    /**
     * Omit the return value, default is false
     */
    omitReturn: boolean;
};
```
