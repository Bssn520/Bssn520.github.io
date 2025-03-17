---
layout: post
title:  "Parallels上安装配置Alpine虚拟机进行C/C++开发"
author:
- Luke
categories: Linux
comments: true
---
> 本文创建于 `2024-12-10`；修改于 `2024-12-10`；

### 一、下载 alpine 官方镜像

官网：[ Alpine official download](https://alpinelinux.org/downloads/)

选择 Standard 中 的 aarch64 下载

### 二、安装镜像

参考：[vmware安装alpine linux_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1H3411H7W4)

### 三、配置 ssh

1. 编辑 ``vi /etc/ssh/sshd_config``，根据需求自行配置端口、登录方式等选项；

如果你跟我一样有用 VsCode 连接进行远程开发的需求，记得在配置 ``sshd_config`` 打开以下选项：

- ``AllowTcpForwarding yes``
- ``PermitTunnel yes``
- ``GatewayPorts yes``

2. 保存并退出后，重启 ssh 服务：

- ``service sshd restart``

### 四、安装常用软件

安装之前，记得配置一下软件源，根据根据alpine版本和网络情况自行选择源，我这里使用官方源:

1. 查看 alpine 版本：

```
[root@alpine-parallels ~]# cat /etc/alpine-release
3.21.0
```

2. 添加软件源：

```
# vi /etc/apk/repositories
http://dl-cdn.alpinelinux.org/alpine/v3.21/main
http://dl-cdn.alpinelinux.org/alpine/v3.21/community
```

之后不要忘了执行 `apk update` 更新软件源列表。

3. 安装软件以及开发所需工具

根据需求安装即可，例如：

```
# build-base: 提供 GCC、G++ 和其他编译工具; 
# linux-headers: 提供 Linux 内核头文件。
apk add build-base linux-headers

# 一个顺手的编辑器以备不时之需
apk add neovim

# 根据需求添加即可
apk add git wget curl bash
...

```

### 五、设置默认shell

1. 安装 bash

`apk add bash`

2. 在 Alpine 上，默认的 shell 信息存储在 **/etc/passwd** 文件中。你可以手动编辑该文件，改变用户的默认 shell 为 /bin/bash。

编辑 /etc/passwd 文件：

`vi /etc/passwd`

找到你的用户名（例如 **root** 或其他用户名），你会看到类似如下的条目：

`root:x:0:0:root:/root:/bin/ash`

更改为：

`root:x:0:0:root:/root:/bin/bash`

保存并退出，现在，当你重新登录时，bash 应该成为默认的 shell。

3. 配置 .bashrc 文件

`.bashrc` 文件通常位于用户的 home 目录下，如果它不存在，可以手动创建或编辑它：

```
# vi ~/.bashrc

# 设置命令提示符
PS1='[\u@\h \W]\$ '

# 设置别名
alias ll='ls -al'
alias cl='clear'
alias nv='nvim'
alias n='nvim'

# 添加自定义路径
export PATH="$PATH:/usr/local/bin"

```

### 六、杂记，以后想起来再加吧...

1. 命令方式打开 Parallels 虚拟机，减少不必要的内存占用：

```
# 启动名为 "alpine" 的虚拟机
prlctl start "alpine"

# 查看虚拟机配置
prlctl list -a -i
```

2. ...
