import { overrideAlert, overridePrompt } from './override-prompt';

import { Export, Import, commit, set } from '../../../../lib/index';

// 环境默认语言
export let envDefaultLanguage: 'zh-CN' | 'en-US' = 'en-US';

try {
    if (
        String(
            globalThis?.navigator?.language ||
                (globalThis as any)?.process?.env?.LANG ||
                (globalThis as any)?.process?.env?.LC_CTYPE,
        )
            .toLowerCase()
            .includes('zh')
    ) {
        envDefaultLanguage = 'zh-CN';
    }
} catch (e) {}

if (!import.meta.env.SSR) {
    if (!(window as any).channel) {
        // 创建一个信道
        const channel = new BroadcastChannel('demo');

        // 将模块 window 导出到信道
        Export(window, channel);

        // 从信道导入模块
        const otherWindow = Import<typeof window>(channel);

        // 为了方便你直接打开控制台进行调试，我把这些变量直接写到当前窗口的 window 对象下
        Object.assign(window, { Export, Import, commit, set, otherWindow, channel });

        (window as any).openNewWindow = () => {
            commit(otherWindow.close());
            window.open(location.href, '_blank', 'popup=1,left=8,top=8,width=600,height=400');
        };

        overridePrompt();
        overrideAlert();
    }
}
