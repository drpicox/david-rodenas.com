---
icon: tasks
title: Smart Data
abstract: > 
  I can help you choose the
  right data storage for you project,
  migrate from one technology to another,
  improve the speed and performance of your app,
  or just develop the data access for your app.
  There are lots of storage technologies,
  SQL databases, document databases,
  key/value storages, caches, indexes.
  I have worked with many of them,
  and even 
  I have implemented some parts of them.
  My expirience is that is critical to
  choose the right technology,
  but also to build the right queries
  by proposing the right algorithms 
  for hard problems.
  And best of all is that
  response times can be reduced 
  to the minimum.
next:
  url: "#/real-time"
  text: Going real-time
resources:
  - mysql
  - postgresql
  - mongodb
  - neo4j
  - cassandra
  - hadoop
  - redis
  - memcached
  - couchdb
  - lucene
  - solr
tags:
  - data
---
## Overview

The big problem is not how to store large amounts of data,
is how to process large amounts of data.

I have been working for many years with 
problems of processing a large amount of data,
but also dealing with complex data processes.
In many of those cases solutions 
I have used as smart as possible the right technology,
but many other times I have modified
the algorithm to get the best result in time.

## Storage technologies 

### SQL storages

For many year SQL storage systems have been the most successful ones 
for some reasons:

- they can handle a reasonable amount of data,
- they are safe and secure,
- they are fast retrieving specific information and generating lists,
- they can be used through SQL, a
  declarative language easy to use that do not require
  previous knowledge about computer science.

Many professional solutions have been emerged, 
like Oracle, SQL Server, DB2, ...,
but also some open alternatives have been grouth
giving the same performance or even better in some
scenarios, like PostgreSQL and MySQL.
  
#### Speedup and optimize SQL 

Although SQL is easy to use, and
do not require great insights of
what is happening at low level,
understand the basis of the technology
and how it works it is critical to get
good performance.

I have been working with many SQL
queries, and I have optimized some
critical ones. 
In many cases, 
it is critical to
understand how to 
data is retrieved 
(beyond creating indices 
and clusters) 
but also to understand what are you
trying to get.
In some of my projects
I have been able to reduce some 
complex queries from days to seconds or less,
just using better algorithms with very close results.

#### Transactions and tradeoff

SQL databases are known for 
their transactional capacity
(usually known as
[ACID]).

Transactions are great because they 
give great confidence and security.
But this comes with a price:
it takes a lot of resources and planning.
What happens if two queries are 
modifying the same object?, what if
you are listing some rows and one is addded?
All these case scenarios are handled
automatically for a cost.

The question is: 
is it really worthy to have transactions?
What happens if I have a slightly 
inconsistences time to time?
is there any other mechanism to write queries
to avoid transactions cost?

If you can have slightly inconsistences as
for example, 
not to have one book added by other user
1 second ago in a list of books,
you can relax consistence and use even
NoSQL databases.
But there are other mechanism to
write queries to void transaction costs.
Usually, when we let to the database handle
transactions, we charge to the database
all the cost of computing how to make safe
each transaction. 
The database engine always takes the safer
approach, but not always the fastest.
We can move some of the transaction
computing cost to ourselfs, 
plan better queries, and
most of them involves the theory of parallel
programming. 
Applying this knowledge it is possible to make 
queries safe as transactions but with a 
minimal part of the cost.
In this case, one of the best engines is
MySQL. It has the MyISAM engines, that does not
have transactions, but it have very powerful
SQL extensions that allows make useful atomic changes
(as for example 
[upsert](http://en.wikipedia.org/wiki/Merge_(SQL\)) 
operation).

#### CAP theorem

> I should write one chapter about the
> CAP problem, meanwhile yo can read
> a good explanation 
> [here](http://architects.dzone.com/articles/better-explaining-cap-theorem)
> or
> [here](http://ksat.me/a-plain-english-introduction-to-cap-theorem/).


### NoSQL storages

NoSQL databases are designed to overcome
SQL limitations and get better results 
in fields where SQL has not proven to be suitable.

> Many people thinks that SQL is suitable for
> every problem, but there is not such silver bullet,
> because of this, we have NoSQL.

Nowadays we have three kinds of NoSQL solutions:
massive data storages, 
graph databases,
and document databases.
They are young, open source, 
and have a large community supporting them.

**Massive data storages** are designed to handle
a high volume of data. 
They usually work as key-value storages,
has many replicas, high availability,
data stamping, ...
The two most powerful engines are
[Hadoop](http://hadoop.apache.org/)
(combined with [HBase](http://hbase.apache.org/)) and
[Cassandra](http://cassandra.apache.org/).

**Graph databases** are known as 
*join* databases and are
specialized in fast querying
through many relationships.
These databases create storages
based on joins or relationships 
instead of data, they have a 
poor performance listing data,
but they are very fast crossing
relationships between records or objects.
An example of query could be: which of
my friends relatives have more 
acquaitances with me.
Some of the most well known engines are
[Neo4j],
[OrientDB](http://www.orientdb.org/), and
[DEX](http://www.sparsity-technologies.com/dex.php)
(this last one which is propietary but I
have worked in the engine).
There is also a new, in early stages, 
framework based in Hadoop called
[Giraph](http://giraph.apache.org/intro.html),
it is able to deal with massive databases
and be fast in graph queries.

**Document databases** are focused,
rather in the performance, but in the flexibility.
SQL databases are rigid:
tables an columns can be modified,
but it requires an effort for migration 
and application queries updates.
Many projects starts with one database schema,
but they evolve to a very different schema.
Document databases have no schema,
just collections of objects, and 
each object has a free shape.
You can change contents, formats, but
queries still works, and content retrieval remains the same.
There are two relevant engines: MongoDB and CouchDB.
[MongoDB](http://www.mongodb.org/) 
is the most simple to use, 
it really suits NodeJS very well,
but its scalabilty seems to be limited.
[CouchDB]
has a very close approach, 
it is a little less user friendly,
but it has a very strong REST API,
it offers really fast cache access mechanisms,
and a very good performance in large data sets.
Both, MongoDB and CouchDB, offers
the possibility to write Javascript
MapReduce queries, these quieres allows to
build massive queries, and are very
competitive against massive data
storages.

### In-memory storages

Hard disk is really slow compared to memory,
and in the other hand
the amount available memory is nowadays really large 
(you can fit almost any company database in memory).
From this point of view should seem that databases
are not longer necessary but databases offers 
many functionalities that are still useful:

- **persistence**: although you can use volatile
fast memory to access to data, you want to store
results in the disk,
- **querying and indexing**: data structures are very 
complex, and difficult to mantain, the abstraction
offered by databases to make queries are really useful,
- **data server**: usually databases are shared
by many apps, that means that they must offer a remote
service to get data 
(it may be seem ineficient, 
because you have to connect thourgh a network, 
which is slow, but networks are faster than hard disks
and the final balance is really positive).

#### Distributed in-memory storages

Because some times, there is not enough
memory in a single machine, or we have so many
clients accessing simultaneously, 
in-memory databases can be distributed into
a cluster.

One of the most relevant open source in-memory
storages is 
[Redis](http://redis.io/), which even
offers full [ACID].
In the other hand, the previously presented 
[Giraph](http://giraph.apache.org/intro.html)
works in-memory over a Hadoop cluster.


### Data caches and indexing services

There are products to boost the efficiency
of databases like data-caches and indexing databases.

**Data caches** tryies to take advantage 
of fast volatile memory, but assuming that may
be you cannot load all full database.
They are also usually used to store intermediate
results and share data between multiple nodes,
instead of executing each time a costly SQL sentence
(which must be interpreted, planned, executed,
retrieved, and the result reconstructed into an object)
they allow to access directly to an object
previously cached without overheads.
The most popular data cache is
[memcached](http://memcached.org/)
which is designed tu run as a database server,
but also can be embedded in your app to save
network penalty. 
Some databases, like [CouchDB], 
have integrated [memcached] in their drivers,
so it integrates seamesly and you can access
to object collections as they was local 
(no worries about performance issues).

**Indexing databases** are designed to 
manage complex document indexing.
Databases have many kind of indexes, 
but some data structures, usually texts,
are very hard to index.
There are indexing servers that
allows us to make smart indexing on
complex documents, and perform complex
queries in almost no time.
One of the most populars is
[Lucene], a library that can be
embedded in our app to have full
access and speed (no network required,
it for example is used internally by [Neo4j]),
and [Solr], which is a REST server for
[Lucene] that can be used as a data-server
shared by many apps.

### Google drive spreadsheet as database

Many small and medium companies use excel as their
internal databases. They are simple, easy to use,
and do not require too knowledge. 
Some time ago Google created a service which
offered *excel* spreadsheets in cloud.
As a project, taking advantage of the possibility
to export data a JSONP, I have developed a small
project to extract data from one of these spreadsheets
in the cloud, and put data safely in a public web page.

In this case the example can be found in
[Traspharma sell page](http://www.traspharma.com/enventa.html).

## Algorithms

### Choosing the right algorithm

Most simple queries do not require any special tratment:
a list of records of a database is just to show what is stored as is,
but there are many other queries that does not fit as 
well and you must choose the right algorithm (or plan) to obtain it.

Most complex queries are those related to
ranking (which elements are more relevants),
recommendations (which suits best for a customer, or to a set of objects),
and matching (which matches better with this other object).
These queries usually has to deal with all data to 
find one result.
In some cases, the problem is so complex, that
the cost of the solution is not linear: 
more customer you have, more times is expensive 
(for example, you have 1000 times more customers, 
but the cost is 1000000 times greater.)

These large queries are often computed in batch
processes. Some years ago took at least one week
to amazon compute cross-references for they
products. That means that it does not care how
good is the result that amazod had computed,
they were one week late.

To find the best algorithm and get 
best performance I use this *spanish say*:

> What cannot be, cannot be,
> but it is also impossible.

It seems a little obvious, 
but it spots that we have done something wrong
(it reminds me the *Sherlock* say:
*"when you have eliminated the impossible, whatever remains, however improbable, must be the truth"*).

**My approach to solve these complex queries**
are to reevaluate the query itself.
For example, in the case of the amazon they can argue
that they have computed the perfect stadistical function,
but resulting data arrived one week later. 
What happened with one week offers? How they affected?
So, the solution is to find a new query, with a result very
close to the original one, but which can be computed faster.
May be the quality is not the same, 
but the result arrive in time and they can give results
since the first second, so, its effectivity, can be better.
One example where I have applied that approach
successfully is my product [Eltanin](http://eltanin-eye.com).
It is able to process a large queries, but
these queries are processed in real time in less than
0.1 seconds. 


<!-- References -->
[ACID]: http://en.wikipedia.org/wiki/ACID "Atomicity Consistency Isolation Durability"
[CouchDB]: http://couchdb.apache.org/ "CouchDB, just relax"
[memcached]: http://memcached.org/ "Memcached"
[Neo4j]: http://www.neo4j.org/ "Neo4j"
[Lucene]: http://lucene.apache.org/core/ "Apache Lucene Java Library"
[Solr]: http://lucene.apache.org/solr/ "Apache Solr Server"
