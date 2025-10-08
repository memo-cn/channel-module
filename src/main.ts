import { boolean, Channel, Export, has, Import, optional, set, typeOf } from '../lib';
import { parse, stringify } from 'json-serialization';
import { createFunctionSerDes } from '@json-serialization/function';
import { errorDeserializer, errorSerializer } from '@json-serialization/error';
import { OperationType } from '../lib/common/operation';

// securityDemo();
async function securityDemo() {
    const id = 's';
    const module = {
        name: 'memo',
    };
    Export({ module, channel: window, id, permissions: 'all' });

    const { commit } = Import<typeof module>({ channel: window, id });

    console.log(
        await commit((m) => {
            const Function: typeof globalThis.Function = m.constructor.constructor as any;
            const twoSum = Function('a', 'b', 'return a + b;');
            return twoSum(3, 4);
        }),
    );
}

// csDemo();

async function csDemo() {
    const channel: Channel = {
        async postMessage(msg) {
            import.meta.hot!.send('channel-module', await stringify(msg, [functionSerDes.serializer, errorSerializer]));
        },
    };

    import.meta.hot!.on('channel-module', async (msg) => {
        if (channel.onmessage) {
            channel.onmessage(await parse(msg, [functionSerDes.deserializer, errorDeserializer]));
        }
    });

    const functionSerDes = createFunctionSerDes(channel);

    const { commit } = Import<any>({ channel, id: 'vite' });
    console.log(
        await commit((module) => {
            const fs = module.fs as typeof import('fs');
            const buffer = fs.readFileSync('./index.html');
            const text = buffer.toString();
            return text;
        }),
    );

    console.log(
        await commit((module) => {
            const exec = module.require('child_process').exec as typeof import('child_process').exec;
            exec('node -v', (error, stdout, stderr) => {
                // console output: v21.7.3
                console.log('node version:', stdout);
            });
        }),
    );
}

// permissionDemo();
async function permissionDemo() {
    const id = 'permissionDemo';
    const module = {
        name: 'memo',
        echo(x: any) {
            return x;
        },
        arr: {
            1: {},
            b: [],
        },
    };
    Export({
        module,
        channel: window,
        id,
        permissions: [
            // 'all',
        ],
    });
    const { commit } = Import<typeof module>({ channel: window, id });
    console.log(
        await commit((m) => {
            return m.echo.name;
        }),
    );
}

// demo1();
async function demo1() {
    const id = 'demo1';
    const module1 = {
        name: 'memo',
        eat() {
            console.log('eat');
        },
        throw() {
            null();
        },
    };
    // window.onmessage = ev => {
    //     console.warn(ev.data);
    // }
    Export({ module: module1, channel: window, id, permissions: ['all'] });

    const { commit } = Import<typeof module1>({ channel: window, id });

    await commit((module2) => {
        return module2.eat.toString();
    });

    await commit((module2) => set(module2.eat, null));

    console.log(await commit((module2) => optional(module2.eat).toString()));
    console.log(await commit((module2) => boolean(module2.eat)));
    console.log(await commit((module2) => typeOf(module2.name)));
    commit((module2) => {
        module2.throw();
    }).catch((e) => {
        console.error(e);
    });
}

arrayDemo();

async function arrayDemo() {
    const id = 'arrayDemo';
    Export({ module: globalThis, channel: window, id, permissions: 'all' });

    const { commit } = Import<typeof window>({ channel: window, id });

    console.log(
        await commit((remoteWindow) => {
            let array = remoteWindow.Array.of('hello', 'world', '!');
            array.push('no');
            delete array[1];
            array[2] = 'memo';
            return array;
        }),
    );
}
