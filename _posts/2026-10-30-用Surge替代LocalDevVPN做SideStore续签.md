---
layout: post
title:  "用 Surge 替代 LocalDevVPN，给 SideStore 做自动续签"
author:
- Luke
categories: iOS
comments: true
---
> 本文创建于 `2026-10-30`；

SideStore 续签，绕不开 `10.7.0.1` 这个回环地址。官方做法是再装一个 LocalDevVPN。

可我手机上已经开着 Surge 了。再挂一个 VPN，既多余，也容易抢路由。

于是想：既然 Surge 本身就能改路由、改 IP，为什么还要多开一个？

## 本质

SideStore 刷新时，会连本机的 `10.7.0.1`。LocalDevVPN 的作用，就是把这个地址指回手机自己。

Surge iOS 5.23.0 起支持 `IP Rewrite` 的 `reflect`。一句话：把目标 IP 改写成当前设备自身。

所以 LocalDevVPN 要干的事，Surge 一条规则就够了。

## 模块

```
#!name=SideStore Loopback
#!desc=用 Surge 替代 LocalDevVPN 做 10.7.0.1 回环（需 Surge iOS 5.23.0+，开增强模式）

[General]
ipv6-vif = disabled
tun-included-routes = %INSERT% 10.7.0.1/32

[IP Rewrite]
10.7.0.1 = reflect
```

两点别漏：

- 开增强模式，否则 `IP Rewrite` 不生效。
- `tun-included-routes` 用 `%INSERT%`，只把 `10.7.0.1/32` 塞进现有路由，别用 `%APPEND%` 把整段覆盖掉。

模块我丢在自己的 Scripts gist 里，Surge 直接订阅。

## 再配快捷指令

回环通了以后，续签本身还是 SideStore 的事。把「刷新全部 App」丢进快捷指令，再挂个定时自动化，就能定期自动续签，不用再盯着七天过期。

以前是 LocalDevVPN + 手动点；现在是 Surge 常驻 + 快捷指令定时跑。少一个 App，少一步操作。

## 一点判断

不是所有代理客户端都能这么干。Loon 大致也能；Shadowrocket 大概率可以；Quantumult X、Stash、Egern 我还没确认。

对我来说，结论很简单：已经在用 Surge，就没必要再为 SideStore 单独养一个 VPN。
