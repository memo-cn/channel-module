import { DefaultTheme, defineConfig } from 'vitepress';

const nav: DefaultTheme.NavItem[] = [
    {
        text: 'Guide',
        link: '/en-US/guide/quick-start.md',
        activeMatch: '/en-US/guide/',
    },
    {
        text: 'API',
        link: '/en-US/api/reference.md',
        activeMatch: '/en-US/api/',
    },
    {
        text: 'Change Log',
        link: '/en-US/CHANGELOG.md',
    },
];

const sidebar: DefaultTheme.Sidebar = {
    '/en-US/guide/': [
        {
            text: 'Guide',
            items: [
                {
                    text: 'Quick Start',
                    link: '/en-US/guide/quick-start.md',
                    items: [
                        {
                            text: 'Creating Channels',
                            link: '/en-US/guide/quick-start.md#creating-channels',
                        },
                        {
                            text: 'Exporting Objects',
                            link: '/en-US/guide/quick-start.md#exporting-objects',
                        },
                        {
                            text: 'Importing Modules',
                            link: '/en-US/guide/quick-start.md#importing-modules',
                        },
                        {
                            text: 'Calling Modules',
                            link: '/en-US/guide/quick-start.md#calling-modules',
                            items: [
                                {
                                    text: 'Reading Properties',
                                    link: '/en-US/guide/quick-start.md#reading-properties',
                                },
                                {
                                    text: 'Setting Properties',
                                    link: '/en-US/guide/quick-start.md#setting-properties',
                                },
                                {
                                    text: 'Calling Functions',
                                    link: '/en-US/guide/quick-start.md#calling-functions',
                                },
                            ],
                        },
                    ],
                },
                {
                    text: 'Creating Channels in Various Scenarios',
                    link: '/en-US/guide/creating-channels-in-various-scenarios.md',
                    items: [
                        {
                            text: 'BroadcastChannel',
                            link: '/en-US/guide/creating-channels-in-various-scenarios.md#broadcast-channel',
                        },
                        {
                            text: 'Worker',
                            link: '/en-US/guide/creating-channels-in-various-scenarios.md#worker',
                        },
                        {
                            text: 'Iframe',
                            link: '/en-US/guide/creating-channels-in-various-scenarios.md#iframe',
                        },
                        {
                            text: 'Background scripts',
                            link: '/en-US/guide/creating-channels-in-various-scenarios.md#background-scripts',
                        },
                        {
                            text: 'Inter-Process Communication',
                            link: '/en-US/guide/creating-channels-in-various-scenarios.md#ipc',
                        },
                        {
                            text: 'WebSocket',
                            link: '/en-US/guide/creating-channels-in-various-scenarios.md#websocket',
                        },
                    ],
                },
                {
                    text: 'Serialization Issues',
                    link: '/en-US/guide/serialization-issues.md',
                    items: [
                        {
                            text: 'Prefer Using Native Interfaces for Serialization',
                            link: '/en-US/guide/serialization-issues.md#prefer-using-native-interfaces-for-serialization',
                        },
                        {
                            text: 'Recommended Serialization Solutions',
                            link: '/en-US/guide/serialization-issues.md#recommended-serialization-solutions',
                        },
                        {
                            text: 'Installation and Usage Example',
                            link: '/en-US/guide/serialization-issues.md#installation-and-usage-example',
                        },
                    ],
                },
            ],
        },
        {
            text: 'API Reference',
            link: '/en-US/api/reference.md',
        },
    ],
    '/en-US/api/': [
        {
            text: 'API Reference',
            link: '/en-US/api/reference.md',
            items: [
                {
                    text: 'Channel',
                    link: '/en-US/api/reference.md#channel',
                },
                {
                    text: 'Export',
                    link: '/en-US/api/reference.md#export',
                },
                {
                    text: 'Import',
                    link: '/en-US/api/reference.md#import',
                },
                {
                    text: 'Commit',
                    link: '/en-US/api/reference.md#commit',
                },
            ],
        },
    ],
};

export const en_US_config = defineConfig({
    themeConfig: {
        nav,
        sidebar,
    },
});
