// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
const path = require('path');
const fs = require('fs');

// 复制 Change Log 文件
copy(path.resolve(__dirname, '../CHANGELOG.md'), path.resolve(__dirname, '../docs/zh-CN/CHANGELOG.md'));
copy(path.resolve(__dirname, '../CHANGELOG.md'), path.resolve(__dirname, '../docs/en-US/CHANGELOG.md'));

function copy(from, to) {
    try {
        fs.unlinkSync(to);
    } catch {}
    fs.copyFileSync(from, to);
}
