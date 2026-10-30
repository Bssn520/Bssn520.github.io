---
layout: post
title:  "用 Surge 替代 LocalDevVPN，给 SideStore 做自动续签"
author:
- Luke
categories: iOS
comments: true
permalink: /p/22/
redirect_from:
  - "/ios/2026/10/30/用Surge替代LocalDevVPN做SideStore续签.html"
  - "/ios/2026/10/30/用Surge替代LocalDevVPN做SideStore续签"
  - "/ios/2026/10/30/用Surge替代LocalDevVPN做SideStore续签/"
---
> 本文创建于 `2026-10-30`；同日补充快捷指令与 Loon 说明。

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

我用的这套快捷指令是给 **Surge + Seal** 准备的，不是裸跑 SideStore：

- 快捷指令：[iCloud 链接](https://www.icloud.com/shortcuts/561b1c4a0cbe422a9fa12640426d56b0)
- Seal 是什么、怎么配，看这个视频：[BV1k5HS6aE5s](https://www.bilibili.com/video/BV1k5HS6aE5s/)

以前是 LocalDevVPN + 手动点；现在是 Surge 常驻 + 快捷指令定时跑。少一个 App，少一步操作。

## Loon 怎么替代（未测试）

正文里写过「Loon 大致也能」。有网友追问具体怎么做，我查了官方文档，整理如下。

**我没有 Loon，下面整段都没实测。** 按文档推导，欢迎用 Loon 的朋友反馈。

Loon 从 Build **1007** 起支持 `include-tun` 和插件里的 `[IP Rewrite]`，官方示例就是 `10.7.0.1 = reflect`，思路和 Surge 同构。参见：[Plugin 文档](https://loon0x00.github.io/docs/Plugin)、[General · include-tun](https://loon0x00.github.io/docs/General)。

注意：`[IP Rewrite]` **只能写在插件里**，写主配置不生效。

可对标 Surge 建一个插件：

```
#!name=SideStore Loopback
#!desc=用 Loon 替代 LocalDevVPN 做 10.7.0.1 回环（需 Build 1007+，未测试）

[General]
include-tun = 10.7.0.1/32
ipv6-vif = off

[IP Rewrite]
10.7.0.1 = reflect
```

启用插件后，断开再连一次 Loon 的 VPN，让路由生效；同时关掉 LocalDevVPN 或旧的 SideStore WireGuard 隧道（iOS 同时只能挂一个 VPN）。然后在 SideStore 里试 Refresh，看 Device Reachability。

几点别踩坑：

- Build 低于 1007 没有 IP Rewrite。
- 主配置若把 `10.7.0.1` 写进更具体的 `bypass-tun`，可能盖掉插件的 `include-tun`。
- 别再走「导入 SideStore 的 WireGuard `.conf`」那条旧路；2023 年有人说 Loon 不支持那种回环，指的是 WG，不是现在的 `reflect`。
- 上面那条 iCloud 快捷指令是 Surge + Seal 路径，**不要当成 Loon 方案照搬**。Loon 有 `Loon://on` / `Loon://off`，和 Seal 怎么拼，我没测过。

若只是想换掉 LocalDevVPN、不一定非用 Loon，社区也有 ClashMi 的现成覆写可参考：[Sidestore-ClashMi](https://github.com/tom-snow/Sidestore-ClashMi)。

回环和 anisette 是两件事。签名服务器、on-device anisette 仍在 SideStore 设置里管，跟代理客户端无关。

## 一点判断

不是所有代理客户端都能这么干。Loon 按官方文档，能力已经对齐；Shadowrocket 大概率可以；Quantumult X、Stash、Egern 我还没确认。

对我来说，结论很简单：已经在用 Surge，就没必要再为 SideStore 单独养一个 VPN。
