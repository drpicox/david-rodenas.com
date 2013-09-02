---
title: memcached
image: images/resources/memcached.png
url: http://memcached.org/
source: https://github.com/memcached/memcached
tags:
  - data
  - cache
  - server
  - rest
abstract: >
  Memcached is a query accelerator for databases.
  
---
Reading data from a database is a slow operation
(it has to read from hard disk which is slow).
Memcached offsers a shared memory space service where 
multiple apps can store temporal results,
and reuse them later 
(saving time).

Memcached can be used as a library or as a server.
An app can use it remotely through REST.
The key point is that it can be used as a shared
memory between multiple apps and it
scales very well.
