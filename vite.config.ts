import { defineConfig } from 'vite';
import { resolve } from 'path';
import { name } from './package.json';
import { parse, stringify } from 'json-serialization';
import { createFunctionSerDes } from '@json-serialization/function';
import { errorSerializer, errorDeserializer } from '@json-serialization/error';

import * as fs from 'fs';
import { exec } from 'child_process';

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

import { Channel, Export } from './lib';

export default defineConfig({
    plugins: [
        {
            name: 'server',
            apply: 'serve',
            configureServer(viteDevServer) {
                const channel: Channel = {
                    async postMessage(msg) {
                        viteDevServer.hot.send(
                            'channel-module',
                            await stringify(msg, [functionSerDes.serializer, errorSerializer]),
                        );
                    },
                };

                viteDevServer.hot.on('channel-module', async (msg) => {
                    if (channel.onmessage) {
                        channel.onmessage(await parse(msg, [functionSerDes.deserializer, errorDeserializer]));
                    }
                });

                const functionSerDes = createFunctionSerDes(channel);

                Export({
                    module: {
                        fs,
                        exec,
                        require,
                        console,
                        import: (name: string) => import(name),
                    },
                    channel,
                    id: 'vite',
                });
            },
        },
        {
            name: 'inject-title',
            apply: 'serve',
            transformIndexHtml(html, ctx) {
                return {
                    html,
                    tags: [
                        {
                            tag: 'title',
                            injectTo: 'head-prepend',
                            children: name,
                        },
                    ],
                };
            },
        },
    ],
    build: {
        sourcemap: true,
        minify: false,
        lib: {
            entry: resolve('./lib/index.ts'),
            formats: ['es', 'cjs'],
            fileName(format, name) {
                return `${name}.${format === 'es' ? 'mjs' : 'cjs'}`;
            },
        },
    },
});
