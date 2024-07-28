import {
    Import,
    Channel,
    commit,
    Export,
    ownKeys,
    set,
    deleteProperty,
    defineProperty,
    optional,
    boolean,
    typeOf,
} from '../lib';
import { parse, stringify } from 'json-serialization';
import { createFunctionSerDes } from '@json-serialization/function';

csDemo();
async function csDemo() {
    const channel: Channel = {
        async postMessage(msg) {
            import.meta.hot!.send('channel-module', await stringify(msg, [functionSerDes.serializer]));
        },
    };

    import.meta.hot!.on('channel-module', async (msg) => {
        if (channel.onmessage) {
            channel.onmessage(await parse(msg, [functionSerDes.deserializer]));
        }
    });

    const functionSerDes = createFunctionSerDes(channel);

    const fs = Import<any>(channel).fs as typeof import('fs');
    const buffer = fs.readFileSync('./index.html');
    const text = buffer.toString();

    console.log(await commit(text));

    const sh = Import<any>(channel).import('child_process').exec as typeof import('child_process').exec;

    commit(
        sh('node -v', (error, stdout, stderr) => {
            // console output: v21.7.3
            console.log(stdout);
        }),
    );
}

// demo1();
async function demo1() {
    const module1 = {
        name: 'memo',
        eat() {
            console.log('eat');
        },
    };
    Export(module1, window);
    // window.onmessage = console.warn;

    const module2 = Import<typeof module1>(window);

    console.log(await commit(module2.eat.toString()));

    await commit(set(module2.eat, null));

    console.log(await commit(optional(module2.eat).toString()));
    console.log(await commit(boolean(module2.eat)));
    console.log(await commit(typeOf(module2.name)));
}

// arrayDemo();
async function arrayDemo() {
    Export(globalThis, window);

    const remoteWindow = Import<typeof window>(window);

    let array = remoteWindow.Array.of('hello', 'world', '!');

    array.push('no');

    const deleteResult = deleteProperty(array, 1);

    const setResult = set(array, 2, 'memo');

    console.log(await commit(array));
}
