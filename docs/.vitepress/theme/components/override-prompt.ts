import { envDefaultLanguage } from './custom';

let o2 = false;
export function overrideAlert() {
    if (o2) return;
    o2 = true;
    const html = `
            <div class="alert-dialog-mask">
              <div class="alert-dialog-container">
                <div>
                  <div class="alert-message"></div>
                </div>
                <div>
                  <button class="alert-confirm-button channel-module">Confirm</button>
                </div>
              </div>
            </div>
            `;
    document.body.insertAdjacentHTML('beforeend', html);

    const maskEl: HTMLDivElement = document.querySelector('.alert-dialog-mask');
    const messageEl = document.querySelector('.alert-message');
    const confirmEl: HTMLInputElement = document.querySelector('.alert-confirm-button');

    if (envDefaultLanguage === 'zh-CN') {
        confirmEl.innerText = '确定';
    }

    maskEl.style.display = 'none';

    (window as any).alert = async (message, _default) => {
        messageEl.innerHTML = message;
        maskEl.style.display = '';
        return new Promise<void>((resolve) => {
            promiseList.push({ resolve });
        });
    };

    const promiseList: { resolve: () => void }[] = [];

    confirmEl.onclick = () => {
        maskEl.style.display = 'none';
        promiseList.splice(0, Infinity).forEach((p) => p.resolve());
    };
}

let o1 = false;
export function overridePrompt() {
    if (o1) return;
    o1 = true;
    const html = `
            <div class="prompt-dialog-mask">
              <div class="prompt-dialog-container">
                <div>
                  <div class="prompt-message"></div>
                  <div>
                  <input class="prompt-input channel-module" />
                  </div>
                </div>
                <div>
                  <button class="prompt-confirm-button channel-module">✅ Confirm</button>
                  <button class="prompt-cancel-button channel-module">❌ Cancel</button>
                </div>
              </div>
            </div>
            `;
    document.body.insertAdjacentHTML('beforeend', html);

    const maskEl: HTMLDivElement = document.querySelector('.prompt-dialog-mask');
    const messageEl = document.querySelector('.prompt-message');
    const inputEl: HTMLInputElement = document.querySelector('.prompt-input');
    const cancelEl: HTMLInputElement = document.querySelector('.prompt-cancel-button');
    const confirmEl: HTMLInputElement = document.querySelector('.prompt-confirm-button');

    if (envDefaultLanguage === 'zh-CN') {
        cancelEl.innerText = '❌ 取消';
        confirmEl.innerText = '✅ 确定';
    }

    maskEl.style.display = 'none';

    (window as any).prompt = async (message, _default) => {
        messageEl.innerHTML = message;
        inputEl.value = _default || '';
        maskEl.style.display = '';
        inputEl.focus();
        return new Promise<string | null>((resolve) => {
            promiseList.push({ resolve });
        });
    };

    const promiseList: { resolve: (message: string) => void }[] = [];

    confirmEl.onclick = () => {
        maskEl.style.display = 'none';
        promiseList.splice(0, Infinity).forEach((p) => p.resolve(inputEl.value));
    };
    cancelEl.onclick = () => {
        maskEl.style.display = 'none';
        promiseList.splice(0, Infinity).forEach((p) => p.resolve(null));
    };
}
