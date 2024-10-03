import { DefaultTheme, defineConfig } from 'vitepress';

const nav: DefaultTheme.NavItem[] = [
    {
        text: '指南',
        link: '/zh-CN/guide/quick-start.md',
        activeMatch: '/zh-CN/guide/',
    },
    {
        text: 'API',
        link: '/zh-CN/api/reference.md',
        activeMatch: '/zh-CN/api/',
    },
    {
        text: '更新日志',
        link: '/zh-CN/CHANGELOG.md',
    },
];

const sidebar: DefaultTheme.Sidebar = {
    '/zh-CN/guide/': [
        {
            text: '指南',
            items: [
                {
                    text: '快速开始',
                    link: '/zh-CN/guide/quick-start.md',
                    items: [
                        {
                            text: '创建信道',
                            link: '/zh-CN/guide/quick-start.md#creating-channels',
                        },
                        {
                            text: '导出对象',
                            link: '/zh-CN/guide/quick-start.md#exporting-objects',
                        },
                        {
                            text: '导入模块',
                            link: '/zh-CN/guide/quick-start.md#importing-modules',
                        },
                        {
                            text: '调用模块',
                            link: '/zh-CN/guide/quick-start.md#calling-modules',
                            items: [
                                {
                                    text: '读取属性',
                                    link: '/zh-CN/guide/quick-start.md#reading-properties',
                                },
                                {
                                    text: '赋值属性',
                                    link: '/zh-CN/guide/quick-start.md#setting-properties',
                                },
                                {
                                    text: '调用函数',
                                    link: '/zh-CN/guide/quick-start.md#calling-functions',
                                },
                            ],
                        },
                    ],
                },
                {
                    text: '更多场景下的信道创建',
                    link: '/zh-CN/guide/creating-channels-in-various-scenarios.md',
                    items: [
                        {
                            text: '广播频道',
                            link: '/zh-CN/guide/creating-channels-in-various-scenarios.md#broadcast-channel',
                        },
                        {
                            text: '工作线程',
                            link: '/zh-CN/guide/creating-channels-in-various-scenarios.md#worker',
                        },
                        {
                            text: '内嵌窗口',
                            link: '/zh-CN/guide/creating-channels-in-various-scenarios.md#iframe',
                        },
                        {
                            text: '后台脚本',
                            link: '/zh-CN/guide/creating-channels-in-various-scenarios.md#background-scripts',
                        },
                        {
                            text: '进程间通信',
                            link: '/zh-CN/guide/creating-channels-in-various-scenarios.md#ipc',
                        },
                        {
                            text: '网络套接字',
                            link: '/zh-CN/guide/creating-channels-in-various-scenarios.md#websocket',
                        },
                    ],
                },
                {
                    text: '序列化相关问题',
                    link: '/zh-CN/guide/serialization-issues.md',
                    items: [
                        {
                            text: '优先使用原生接口进行序列化',
                            link: '/zh-CN/guide/serialization-issues.md#prefer-using-native-interfaces-for-serialization',
                        },
                        {
                            text: '推荐的序列化方案',
                            link: '/zh-CN/guide/serialization-issues.md#recommended-serialization-solutions',
                        },
                        {
                            text: '安装和使用示例',
                            link: '/zh-CN/guide/serialization-issues.md#installation-and-usage-example',
                        },
                    ],
                },
            ],
        },
        {
            text: 'API 参考',
            link: '/zh-CN/api/reference.md',
        },
    ],
    '/zh-CN/api/': [
        {
            text: 'API 参考',
            link: '/zh-CN/api/reference.md',
            items: [
                {
                    text: '信道（Channel）',
                    link: '/zh-CN/api/reference.md#channel',
                },
                {
                    text: '导出（Export）',
                    link: '/zh-CN/api/reference.md#export',
                },
                {
                    text: '导入（Import）',
                    link: '/zh-CN/api/reference.md#import',
                },
                {
                    text: '提交（Commit）',
                    link: '/zh-CN/api/reference.md#commit',
                },
            ],
        },
    ],
};

export const zh_CN_config = defineConfig({
    themeConfig: {
        nav,
        sidebar,
    },
});
