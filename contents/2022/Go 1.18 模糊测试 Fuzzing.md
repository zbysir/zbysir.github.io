---
title: Go 1.18 模糊测试 Fuzzing
slug: go_fuzzing
date: 2022-09-22
tags: [Golang]
desc: 有用，但用处不大。
---

## 什么是模糊测试（fuzz testing）？
Go 1.18 在 go 工具链里引入了 fuzzing 模糊测试。

模糊测试会自动生成随机用例来测试你的代码，用来寻找人们不容易发现的错误。

> 官方介绍：https://go.dev/security/fuzz/
> 
> Fuzzing is a type of automated testing which continuously manipulates inputs to a program to find bugs. Go fuzzing uses coverage guidance to intelligently walk through the code being fuzzed to find and report failures to the user. Since it can reach edge cases which humans often miss, fuzz testing can be particularly valuable for finding security exploits and vulnerabilities.

## 实例
同事写了一个对比两个版本号大小的方法：
```go
package main

import (
	"strconv"
	"strings"
)

func getVersionParts(version string) []int {
	parts := strings.Split(version, ".")
	out := make([]int, len(parts))
	for i, item := range parts {
		out[i], _ = strconv.Atoi(item)
	}
	return out
}

func CompareAppVersion(v1, v2 string) bool {
	if v1 == "" || v2 == "" {
		return false
	}

	p1 := getVersionParts(v1)
	p2 := getVersionParts(v2)

	for i, v := range p1 {
		if v == p2[i] {
			continue
		}
		if v < p2[i] {
			return false
		}
		return true
	}
	return true
}
```

同时也写了测试用例验证这段代码是否正确：

```go
package test

import "testing"
import "github.com/stretchr/testify/assert"

func TestVersion(t *testing.T) {
	assert.Equal(t, true, CompareAppVersion("0.2", "0"))
	assert.Equal(t, true, CompareAppVersion("0.", "0"))
	assert.Equal(t, true, CompareAppVersion("1.", "0"))
	assert.Equal(t, true, CompareAppVersion("0", "0.0"))
	assert.Equal(t, true, CompareAppVersion("4.16.0", "3.3"))
	assert.Equal(t, false, CompareAppVersion("0", "0.1"))
	assert.Equal(t, false, CompareAppVersion("3", "3.2"))
	assert.Equal(t, false, CompareAppVersion("4.16.0", "5"))
	assert.Equal(t, false, CompareAppVersion("4.16", "5"))
}
```
不过意外还是发生了：

我们已经努力构建了不同的用例来测试代码，不过在线上还是 panic 了，更不幸的是 panic 时不会打印出入参来帮助我们发现问题。

```
panic: runtime error: index out of range [1] with length 1
```

为了解决这个 bug，我们不得不在 `CompareAppVersion` 方法中打印出入参，然后等待线上再次 panic。

有没有更优雅的解决方案？模糊测试出场了！

编写下面的模糊测试代码：

```go
package test

import "testing"

func FuzzCompareAppVersion(f *testing.F) {
	f.Fuzz(func(t *testing.T, a1, a2 string) {
		CompareAppVersion(a1, a2)
	})
}
```

使用下面的命令运行模糊测试
```shell
go test -v ./ -run Fuzz.+ -fuzz=FuzzCompareAppVersion
```

由于用例是随机且大量的，你可能会等待很久。

然后你会得到和线上 panic 同样的错误：`panic: runtime error: index out of range [1] with length 1`。

那到底是什么入参导致了 panic 呢？

运行了模糊测试之后，程序会自动在当前目录下生成 `testdata/fuzz/FuzzCompareAppVersion/xxx` 语料库（Corpus files），打开它：

```text
go test fuzz v1
string(".")
string("0")
```

其中第二行和第三行就是两个入参，现在有了能复现错误的用例，还怕解决不了 bug 么。

## go test 命令模糊测试相关参数 

### -fuzz={FuzzTestName}

默认情况下（不加 -fuzz 参数），go test 是不会运行模糊测试的，这是因为运行模糊测试会穷举用例，十分耗时。

**但如果项目中已有了将上述生成的 testdata 文件夹，那么模糊测试也会运行，不过不会穷举用例，而是使用 testdata 中已经找到的错误用例。**

### -fuzztime 30s

如果模糊测试没找到错误用例则会一直穷举，一直运行下去，一般情况下我们需要限制运行时间或者手动 `Ctrl + C`，如果很长时间都没找到错误就当它没 Bug 吧。

使用 -fuzztime 指定时间，如

- go test -fuzz -fuzztime 30s
- go test -fuzz -fuzztime 1m
