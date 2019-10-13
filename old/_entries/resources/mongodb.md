---
title: mongoDB
image_width: 90
image_height: 200
image: /assets/images/mongodb.png
relevance: 2
url: http://www.mongodb.org/
source: http://www.mongodb.org/downloads
tags: 
  - data
  - nosql
  - scalable
  - document

description: >
  MongoDB is a document oriented database,
  fast and scalable.
  
---
MongoDB is designed to work in dynamic environments
in which schema can change, but also
the requirement to scale for big data.

It is a document oriented database: there is no schema.
Data are JSON documents organized in documents.
It do not have transactions, is eventually consistent,
but it offers specific operations to give security in updates.

Most relevant features:

  - NoSQL,
  - schema-less,
  - high scalability (big data)
  - eventual consistency,
  - fast reading,
  - fast writing,
  - complex indexing,
  - geolocation indexing,
  - queues support structures,
  - map/reduce for complex queries


```javascript
db = new Mongo().getDB("db");
db.createCollection("collection");
doc = { "hello" : "world" };
db.collection.save(doc);
db.collection.find();
```

