---
title: 学习 Go 1.18 泛型
slug: generics_in_go
date: 2022-09-22
tags: [Golang]
desc: 泛型也要慢慢用起来呀。
draft: true
---

# 语法

## 函数（Function）
```go
package main

func To[T any](i interface{}) T {
	return i.(T)
}

```

## 方法（Method）
Method 指的是在结构体上的函数成员

👌
```go
package main

type Container[T any] struct {
	i T
}

func (c Container[T]) Get() T {
	return c.i
}
```

🚫
方法上不支持再声明一个泛型（也许以后会支持）
```go

func (c Container[T]) To[A any]() A {
	return c.i.(A)
}
```
因为这个问题，我们就无法实现一个通用的泛型缓存包。

```go
package main

type Cache struct {
	m map[string]interface{}
}

// 这是泛型前的写法：每次获取了值还必须断言类型。

func (c *Cache) Get(key string) interface{} {
	return c.m[key]
}

// 想要的语法：
// 这样我们在用起来就很舒服： `c.Get[User]("bysir")`，可惜不支持。

func (c *Cache) GetT[T any](key string) T {
	return c.m[key].(T)
}

```

如果非得泛型不得不这样：
```go
package main

type Cache[T any] struct {
	m map[string]T
}
```
不过这就不通用了。

# 实际用途
学习了语法，来看几个实际用途


## JSON 序列化

```go
package main

import "encoding/json"

func Unmarshal[T error](bs []byte) (t T, err error) {
    err = json.Unmarshal(bs, &t)
    return
}


func main() {
    u, err := Unmarshal[User]([]byte(`{"name": "bysir"}`))  
    
    // 泛型前的写法 (能少写一行是一行):
    
    var u User
    err := json.Unmarshal(bs, &u)
}

```

## errors.As

泛型前

```go
package main

func main() {
    var err error = MyError{}

    // 泛型前
    var s MyError
    if errors.As(err, &s) {
        print(s.InnerMsg)
    }

    // 泛型后
    if s, ok := ErrorAs[MyError](err); ok {
        print(s.InnerMsg)
    }
}

func ErrorAs[T error](err error) (t T, ok bool) {
	ok = errors.As(err, &t)
	return
}

```

## 类型系统
> 坑有点大 不写了

## 总结
推荐一个库，基本操作(比如上面提到的 errors.As)可以先去里面找找

- [lo - Iterate over slices, maps, channels...](https://github.com/samber/lo)
