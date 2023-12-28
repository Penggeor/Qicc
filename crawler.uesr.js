// ==UserScript==
// @name         QCC Crawler
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        https://www.qcc.com/*
// ==/UserScript==

//初始化一个有地址的 sciprt 标签，并且注入到页面中
//注意这里我们使用了 run-at 让其在页面开始尽早注入脚本。
let script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.src = "https://cdn.jsdelivr.net/npm/vue@next";
document.documentElement.appendChild(script);

alert('hello world')


