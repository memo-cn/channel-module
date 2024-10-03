// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';

import './components/custom.less';
import './components/custom';
import CodeInput from './components/code-input.vue';
import { envDefaultLanguage } from './components/custom';

export default {
    extends: DefaultTheme,
    Layout: () => {
        return h(DefaultTheme.Layout, null, {
            // https://vitepress.dev/guide/extending-default-theme#layout-slots
        });
    },
    enhanceApp({ app, router, siteData }) {
        // 访问首页时结合浏览器语言进行重定向
        router.onBeforeRouteChange = async (to) => {
            if (to.startsWith('/channel-module')) {
                if (!to.includes('/zh-CN') && !to.includes('/en-US')) {
                    location.replace(location.href.replace('/channel-module', `/channel-module/${envDefaultLanguage}`));
                }
            }
        };

        app.component('CodeInput', CodeInput);
    },
} satisfies Theme;
