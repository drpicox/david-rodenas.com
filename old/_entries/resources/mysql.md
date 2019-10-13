---
title: MySQL
image_width: 112
image_height: 59
image: /assets/images/mysql.png
url: http://www.mysql.com/
source: http://dev.mysql.com/downloads/mysql/
description: >
  MySQL is a SQL database
  optimized for high scalability.
tags:
  - data
  - sql
  
---
MySQL was initially designed for web environments
with low resources.
It's default implementation do not have transactions
but tools to make updates safe and efficient.
Because of these, MySQL services can offer
great capacity and scalability.

Greatest MySQL setup is Facebook.

```sql
INSERT INTO table (a,b,c) VALUES (1,2,3)
  ON DUPLICATE KEY UPDATE c=c+1;
```

