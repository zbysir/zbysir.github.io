---
title: Traefik 与 Swarm 配合实现更新服务零停机（zero-downtime）
slug: traefik_swarm_zero-downtime
date: 2023-12-19
tags: [Dev]
draft: false
desc: 
---

> Version: traefik:v2.9
>

## 启用 Swarm

如果你只是使用 traefik 反代到指定 container（或者多个 container 也一样），当 container 重启、更新的时候，就会产生下线时间，导致请求断开和一小段时间的 502。

要解决这个问题，就需要使用的滚动更新，而滚动更新是 swarm 才有的功能，我们需要先开启它。

开启它十分简单：

```shell
docker swarm init
```

如果是单机节点，这就完成了。如果是多机那就去找资料吧。

接下来就是要创建 service。

我们使用 docker stack 来管理多个服务，配置文件和 docker-compose.yaml 基本一致。

如下是一个包含了 traefik 服务的例子：

```yaml
version: '3.7'

networks:
  traefik:
    external: true
    name: over

services:
  reverse-proxy:
    # The official v2 Traefik docker image
    image: traefik:v2.9
    # Enables the web UI and tells Traefik to listen to docker
    command: |
      --api.insecure=true
      --providers.docker
      --providers.docker.swarmMode=true
      --providers.docker.network=traefix
      --entrypoints.web.address=:80
      --entrypoints.websecure.address=:443
      --certificatesresolvers.myresolver.acme.email=xxx@qq.com
      --certificatesresolvers.myresolver.acme.storage=/data/acme.json
      --certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web

    ports:
      # The HTTP port
      - "80:80"
      - "443:443"
      # The Web UI (enabled by --api.insecure=true)
      - "8080:8080"
    labels:
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
      - "traefik.http.routers.redirect-https.rule=HOST(`huglight.cn`)"
      - "traefik.http.routers.redirect-https.entrypoints=web"
      - "traefik.http.routers.redirect-https.middlewares=redirect-to-https"

    volumes:
      # So that Traefik can listen to the Docker events
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/data/traefix:/data
    deploy:
      mode: global
      restart_policy:
        condition: on-failure
        delay: 2s

    networks:
      - traefik
```

当然啦，更多资料翻翻再官方文档。

你会看到我声明了 network，这是因为我把应用和基础服务（如 db）分成了多个 stack.yaml，这种情况下如果需要互相联通网络就需要声明一个外部的网络，而不是使用默认情况下创建的网络（默认情况下docker 会为每个 stack.yaml 文件创建一个相互隔离的网络）。

在文档中也说了，我们不应该使用默认的网络用作生产环境，而是自己创建一个：

https://docs.docker.com/network/network-tutorial-overlay/

## 创建公用网络

> 如果你是指用于测试，可以跳过这一步。
>

1. 先预先创建一个网络，例如名字叫 gateway

```shell
docker network create   --driver=bridge   --attachable   --internal=false   gateway
```

1. 在  compose 文件中声明 network，例如名字叫 treafic，使用 external 和 name 表明直接使用外部网络，而不是默认创建网络。（具体看官方文档 https://docs.docker.com/compose/networking/#use-a-pre-existing-network）

```shell
networks:
  traefik:
    name: gateway
    external: true
```

1. 在 service 中使用这个 network

```yaml
services:
  penpot-frontend:
    image: xxx/weave:latest

    networks:
      - traefik
```



## 配置 Swarm 滚动更新

默认情况下你的服务配置应该是这样：

```yaml
services:
  weave:
    image: xxx/weave:latest
    environment:
      DB_HOST: pgsql
    command: api
    volumes:
      - ~/data/weave:/data
    labels:
      - "traefik.http.routers.weave.rule=(HOST(`huglight.cn`)) && (PathPrefix(`/api`) || PathPrefix(`/static`))"
      - "traefik.http.routers.weave.priority=2"
      - "traefik.http.services.weave.loadbalancer.server.port=8432"
    deploy:
      restart_policy:
        condition: on-failure
        delay: 2s
    depends_on:
      - pgsql
      - redis
    networks:
      - traefik
```

如果要启动滚动更新，需要在 deploy 下添加上 update_config:

```yaml
services:
  weave:
    deploy:
      # https://docs.docker.com/compose/compose-file/deploy/
      update_config:
        monitor: 5s
        order: start-first
```

`start-first` 的意思是先启动一个 container 然后关闭之前老的 container，这样就能实现 0 下线。

现在就完了吗？我也以为完了，但在测试的时候发现升级服务的时候还是会 502，仔细想了下发现了问题所在：

traefik 通过监听 container 上的 label 来使用路由更新，在更新服务的时候，会生成两个 container，但 traefik 并不知道应该将流量转发到哪个服务，他会负载均衡两个都转发，如果转发到正在关闭的 container 上时就会产生 502 错误。

而如何通知到 traefik 应该下线哪个 container 呢？翻看文档没有发现端倪。

但发现了的 traefik 文档单独有一篇文章讲了 swarm，仔细看了后发现 traefix 是如何解决上述问题的

## 配置启用 trafik swarm mode

traefik 无法知道哪个 container 需要下线，但是 swarm 是知道的，并且 swarm 自己也提供了机制来自动负载多个服务的副本，这就是 overlay 网络。https://docs.docker.com/network/drivers/overlay/

traefik 不应该直接与 container 通讯，而是先链接到 overlay 定义的服务入口然后再由 overlay 网络链接到 container。

要启用这个网络链路，我们需要做两个改动：

1. 启用 traefik swarm 模式。！！注意这是 v2 的写法，我在老的 [文档](https://www.traefik.tech/providers/docker/#swarmmode) 上找到了这样的写法。但新的 v3 使用的的另一个语法：https://doc.traefik.io/traefik/v3.0/providers/swarm/，我还没尝试过，不多说了。

```yaml
services:
  reverse-proxy:
    image: traefik:v2.9
    command: |
      --providers.docker
      --providers.docker.swarmMode=true
```

1. 将服务的 labels 声明移动到 deploy 上：https://doc.traefik.io/traefik/v3.0/providers/docker/#routing-configuration-with-labels

```yaml
services:
  weave:
   deploy:
      labels:
        - "traefik.http.routers.weave.rule=(HOST(`huglight.cn`)) && (PathPrefix(`/api`) || PathPrefix(`/static`))"
        - "traefik.http.services.weave.loadbalancer.server.port=8432"

```

重启服务，下班。