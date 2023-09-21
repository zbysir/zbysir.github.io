---
title: React hooks 产生的变量，如 useMemo 产生的 Memoization value 如何存储？
tags: [技术,前端]
export: false
sort: 17
---

useMemo 看似只是无副作用的函数调用，没有给它传递任何的如组件实例这样的能持久化数据的对象，那它计算出来的值是存放在哪里的？

答案是在每次运行方法函数的时候 提前将组件实例复制给一个全局变量，在 useMemo 中就可以使用这个组件实例来存储变量。
