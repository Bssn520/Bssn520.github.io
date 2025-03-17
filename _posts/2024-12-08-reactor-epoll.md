---
layout: post
title:  "Reactor以及io多路复用"
author:
- Luke
categories: 网络IO
comments: true
---
> 本文创建于 `2024-12-08`；修改于 `2024-12-26`；

## 零、基础知识

### 文件描述符

服务器与客户端的通信流程图如下：

<div style="text-align: center;">
  <img src="https://github.com/Bssn520/picx-images-hosting/raw/master/image.8vmzfvuey8.webp" alt="image" style="zoom:50%;" />
</div>

在服务端，文件描述符可分为两类：监听文件描述符，通信文件描述符；

- 监听文件描述符
  - 用于监听新的客户端的连接请求；
  - 例：accept 函数会检测监听文件描述符的读缓冲区，如果有数据，则建立新的连接；否则阻塞。
- 通信文件描述符
  - 与已经建立连接的客户端进行通信；

每个文件描述符内存结构:

每个文件描述符对应两块内存：读缓冲区，写缓冲区

- 读数据：通过对应的文件描述符，将内存中的数据读出，这块内存称之为读缓冲区；
  - 例：read 或 recv 函数，检测通信文件描述符的读缓冲区，如果有数据则将其读出；否则阻塞。
- 写数据：通过对应的文件描述符，将数据写入到某块内存中，这块内存称之为写缓冲区；
  - 例：write 或 send 函数，检测通信文件描述符的写缓冲区是否有空间供我们写入数据，有空间则写入；否则阻塞。





## 一、select

> select 函数通过轮询获得每个io的状态，根据状态执行不同的操作；

```c
NAME
       select, pselect, FD_CLR, FD_ISSET, FD_SET, FD_ZERO, fd_set - synchronous I/O multiplexing

SYNOPSIS
       #include <sys/select.h>

       int select(int nfds, fd_set *_Nullable restrict readfds,
                  fd_set *_Nullable restrict writefds,
                  fd_set *_Nullable restrict exceptfds,
                  struct timeval *_Nullable restrict timeout);
```

- maxfd， fd即文件描述符，是递增的 int 类型，maxfd 即最大的文件描述符，select 函数内部用来遍历；
- readfds，可读io集合，
- writefds，可写io集合，
- exceptfds，判断某个 `io(即文件描述符)` 是否出错；
- timeout，轮询时长间隔，即多久轮训一次；设置为 ``NULL``时表示一直等待；

### select 缺点：

- 参数较多；
- 每次把待检测 ``io``集合，copy进入内核；
- 对 ``io``的数量是有限制;

### poll

```c
#include <poll.h>
// 每个委托poll检测的fd都对应这样一个结构体
struct pollfd {
    int   fd;         // 委托内核检测的文件描述符
    short events;     // 委托内核检测文件描述符的什么事件
    short revents;    // 文件描述符实际发生的事件 -> 传出
};

struct pollfd fds[100];
int poll(struct pollfd *fds, nfds_t nfds, int timeout);
```

poll 的底层与 select 一样，只是对参数等做了优化，不再重复记录，看代码即可理解；

## 二、epoll

### 成员函数：

1. epoll_create
2. epoll_ctl
3. epoll_wait
