---
title: 为什么 React hooks 不能写在 if 分支里？
tags: [技术,前端]
export: false
sort: 17
---

上一个问题懂了？实际上还隐藏了一个细节，useMemo 的方法调用同样没有传递能区分多次 useMemo 调用的”唯一键“，那为什么多次 useMemo 能够对应上？你可能会想到是通过 create 函数的变量地址来确定唯一，但方法组件每次都会运行，create 函数每次的变量地址都会不一样。

那唯一能区分多次 useMemo 调用的”唯一键”，只有顺序了：第一次 useMemo 对于 第一个 Memoization value。那么为什么不能把 hooks 写在 if 里就不难理解了。

实际上 React 也可以通过代码预处理的方式将每一个 hook 生成唯一 key，但这样会增加复杂度。
