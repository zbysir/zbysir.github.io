---
title: "Docker 容器达到 Memory Limit 后的行为"
slug: docker-memory-limit
date: 2020-03-22
tags: [Docker]
desc: 坑太多了
---

当一个容器申请使用多于整个主机可用的内存时, 内核可能会杀掉容器或者是 Docker daemon (守护进程)来释放内存, 这可能会导致所有服务不可用, 为了避免这个错误, 我们应该给每个容器限制合适的内存.

> [Understand the risks of running out of memory](https://docs.docker.com/config/containers/resource_constraints/#understand-the-risks-of-running-out-of-memory)

我们可以在 Docker-Compose 或者 Docker Stack 环境中使用以下配置来限制容器的内存使用:

```
version: '3.7'
services:
  mysql:
    image: mysql:5.7
    deploy:
      resources:
        limits:
          memory: 200M
      mode: global
      restart_policy:
        condition: on-failure
        delay: 5s
```

> 本文使用 3.7 版本的配置文件语法和 swarm 模式举例, 其他环境会有些差异, 其他版本的配置文件语法可以在官方文档-[compose-file](https://docs.docker.com/compose/compose-file/)
中找到.

> 更多语法, 如限制 CPU 等, 可以查阅[resource_constraints](https://docs.docker.com/config/containers/resource_constraints/)

接下来我们来理解上面的配置

**limits.memory**

> The maximum amount of memory the container can use. If you set this option, the minimum allowed value is 4m (4 megabyte).

容器允许的内存最大使用量, 最小值为4M.

当容器使用了大于限制的内存时, 会发生什么, 触发程序 GC 还是 Kill?

不幸的时, 官方文档好像没有对内存限制说明得很详细, 不过 Google 可以帮忙, 在下面的文章中能找到一点蛛丝马迹:

- [Understanding Docker Container Memory Limit Behavior](https://medium.com/faun/understanding-docker-container-memory-limit-behavior-41add155236c)
- [Docker Compose — Memory Limits](https://linuxhint.com/docker_compose_memory_limits/)
- [https://dzone.com/articles/why-my-java-application-is-oomkilled](https://dzone.com/articles/why-my-java-application-is-oomkilled)
- [https://github.com/kubernetes/kubernetes/issues/50632](https://github.com/kubernetes/kubernetes/issues/50632)
- [https://github.com/kubernetes/kubernetes/issues/40157](https://github.com/kubernetes/kubernetes/issues/40157)

再经过试验证明当程序使用超过 limits.memory 限制的内存时, 容器会被 Kill (cgroup干的 [resource_management_guide/sec-memory](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/resource_management_guide/sec-memory)).

简单的, 可以使用 redis 容器来进行这个实验: 限制内存为 10M, 再添加大量数据给 redis, 然后查看容器的状态.

> [如何高效地向Redis插入大量的数据](https://www.cnblogs.com/ivictor/p/5446503.html)

实际上我们不想让容器直接被 Kill, 而是让 Redis 触发清理逻辑, 直接 Kill 会导致服务在一段时间内不可用(虽然会重启).

怎么办?

各种调研后发现官方提供的其他参数都不能解决这个问题, 包括 memory-reservation, kernel-memory, oom-kill-disable.

- memory-reservation: 看起来是用于swam集群下的调度逻辑- [https://medium.com/@jmarcos.cano/docker-swarm-stacks-resources-limit-f447ee74cb62](https://medium.com/@jmarcos.cano/docker-swarm-stacks-resources-limit-f447ee74cb62)
- kernel-memory: 母鸡
- oom-kill-disable: 如果开启了 oom-kill-disable 那么当容器达到限制内存时不会被杀死, 而是假死, 实际上更惨.

看来并不能傻瓜化的解决这个问题, 现在如果我们只想触发程序的 GC, 应该怎么做?

一般来说, 程序当判定到内存不足时会有自己的 GC 机制, 但正如这篇文章[Understanding Docker Container Memory Limit Behavior](https://medium.com/faun/understanding-docker-container-memory-limit-behavior-41add155236c)里所说, 运行在docker容器里的程序对内存限制是不可见的, 程序还是会申请大于docker limit的内存最终引起OOM Kill.

这就需要我们额外对程序进行配置, 如 redis 的 maxmemory 配置, java 的 JVM 配置, 不幸的是并不是所有程序都有自带的内存限制配置, 如 mysql, 这种情况下建议调低程序性能 和 保证留够的程序需要的内存.

> 这篇文章有提到如何调整 mysql 内存: [https://marcopeg.com/2016/dockerized-mysql-crashes-lot](https://marcopeg.com/2016/dockerized-mysql-crashes-lot)

如果你的服务器开启了 Swap, 有可能还会遇到一个问题: 当容器将要达到内存限制时会变得特别慢并且磁盘 IO 很高(达到顶峰).

这是因为我们还忽略了一个参数: memory-swap, 当没有设置 memory-swap 时它的值会是 memory-limit 的两倍, 假如设置了 limit-memory=300M, 没有设置 memory-swap, 这意味着容器可以使用 300M 内存和 300M Swap. [https://docs.docker.com/config/containers/resource_constraints/#--memory-swap-details](https://docs.docker.com/config/containers/resource_constraints/#--memory-swap-details)

值得注意的是 Swap 并不是无损的, 相反的, 它十分慢(使用磁盘代替内存), 我们应该禁用它。

不过 compose file v3 并不支持 memory-swap limit 的设置, 唉。

- [Docker stack deploy with compose file (version 3) memory-swap/memory-swappiness issue](https://github.com/moby/moby/issues/33742)
- [How to replace memswap_limit in docker compose 3?](https://stackoverflow.com/questions/44325949/how-to-replace-memswap-limit-in-docker-compose-3)

无奈, 那就关闭主机的 swap 吧。

总结 当容器达到内存限制时会发送的事情:
- 容器被 Kill 并重启：为了避免停机，解决办法是限制程序使用的内存, 如 redis 配置 maxmemory，或者将 mysql 的配置降低。
- 如果开启了 swap 则还有 swap 的副作用: 过高的磁盘占用和无比慢的响应时间，解决办法是关闭主机的 swap。

2023-11-06 更新：

虽然我关闭了主机的 swap，但有时候容器再达到 90%+ 内存使用的时候，不会在继续增长内存使用量而 OOM，而是启用了 swap，导致磁盘读取 100%，程序陷入假死状态，看样子还是在使用 Swap。

对了，我又看了一眼，memory-swap 不支持在 service 模式下设置的问题在三年后（写文到现在）依然没人解决，有 [MR](https://github.com/moby/moby/pull/37872) 都不合。

2024-03-07 更新：

经过实验确认证明了关闭主机的 swap 不能控制 docker 使不使用 swap，必须使用 docker 自己的 mem-limit 来控制是否来使用 swap。

并且不一定是容器自身占用内存接近限制时才会使用 swap，有时候是主机内存被其他程序占用不足时，容器也会使用 swap。

然而 docker service 不支持设置 memory-swap，有一些解决方法缓解使用 swap 的问题：
- 使用 docker run 来启动容器，这样可以设置 memory-swap。
- 别用 docker service 了，使用 k8s。
- 严格控制程序自己的内存占用，比如在 go 中，可以通过设置环境变量 `GOMEMLIMIT: "200MiB"` 来限制内存使用，然后将 docker 的 memory-limit 设置得稍微大一点。
- 花钱扩展主机内存。
