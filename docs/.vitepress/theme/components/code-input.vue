<script setup lang="ts">

    import { reactive, watchEffect } from 'vue';
    import { envDefaultLanguage } from './custom';

    const props = withDefaults(defineProps<{
        // 默认代码
        code?: string,
        // 执行完成后是否 alert 提示
        alert?: boolean,
    }>(), {
        code: '',
        alert: true,
    });

    async function executeCode() {
        try {
            const val = await eval('(async function() { return ' + state.code.trim() + ' })();');
            console.log(val);
            if(props.alert) {
                alert(val);
            }
        } catch (e) {
            console.error(e);
            alert(e);
        }
    }

    const state = reactive({
        code: ``.trim(),
    });

    watchEffect(() => state.code = props.code);

    const executeCodeButton = envDefaultLanguage === 'zh-CN' ? '运行' : 'Run';
</script>

<template>
    <div>
        <textarea class="channel-module" v-model="state.code"></textarea>
        <button class="channel-module" @click="executeCode">▶ {{ executeCodeButton }}</button>
    </div>
</template>

<style scoped lang="less"></style>
