import { defineConfig } from 'vitepress';
import { zh_CN_config } from './zh-CN';
import { en_US_config } from './en-US';

const description = {
    en: 'channel-module provides a proxy mechanism that records and forwards basic operations (such as property reading, setting, function calls, etc.) to another JavaScript runtime environment for replay execution.',
    cn: '信道模块提供了一种记录并转发基本操作（如属性读取、赋值、函数调用等）到另一个 JavaScript 运行环境回放执行的代理机制。',
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
    base: '/channel-module/',
    title: 'Channel Module',
    description: `${description.en} ${description.cn}`,

    themeConfig: {
        socialLinks: [
            { icon: 'github', link: 'https://github.com/memo-cn/channel-module' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/channel-module' },
        ],
        lastUpdated: {},
    },

    locales: {
        root: {
            title: 'Channel Module',
            label: 'English',
            description: description.en,
            link: '/en-US/',
            ...en_US_config,
            themeConfig: {
                ...en_US_config.themeConfig,
                footer: {
                    copyright: `Copyright © 2024-present memo-cn`,
                },
                editLink: {
                    pattern: 'https://github.com/memo-cn/channel-module/edit/main/docs/:path',
                    text: 'Edit this page on GitHub',
                },
            },
        },
        'zh-CN': {
            title: '信道模块',
            label: '简体中文',
            description: description.cn,
            link: '/zh-CN/',
            ...zh_CN_config,
            themeConfig: {
                ...zh_CN_config.themeConfig,
                footer: {
                    copyright: `版权所有 © 2024-present memo-cn`,
                },

                editLink: {
                    pattern: 'https://github.com/memo-cn/channel-module/edit/main/docs/:path',
                    text: '在 GitHub 上编辑此页面',
                },

                docFooter: {
                    prev: '上一页',
                    next: '下一页',
                },

                outline: {
                    label: '页面导航',
                },

                lastUpdated: {
                    text: '最后更新于',
                    formatOptions: {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                    },
                },

                langMenuLabel: '多语言',
                returnToTopLabel: '回到顶部',
                sidebarMenuLabel: '菜单',
                darkModeSwitchLabel: '主题',
                lightModeSwitchTitle: '切换到浅色模式',
                darkModeSwitchTitle: '切换到深色模式',
            },
        },
    },
});
