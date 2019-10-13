---
title: REST
icon: cogs
description: >
  REST is a standard application
  communication protocol based
  in the HTTP protocol. 

tags:
  - apps
  - server
  - rest
  
---
To describe REST or how it came is a little bit complex.
Like 
<resource-link basename="json"></resource-link>
was a technology that was from the beginning just in
front of us and just one day hit us.

It is based in the 
[HTTP](http://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol),
the protocol used to send web pages to your browser,
but it have been slightly extended to send data between 
applications and services rather from servers to people.

## URL and resources

Http addresses have been always describing how to reach a resource
(a document, a directory, a CGI, ...). 
In REST they are describing also which resource do you have to 
access, but instead of following any arbitrary rule, it is based
in the following convention: data is classified in collections,
each collection has many objects with one unique identifier, and this
objects can have relationships. 

A standard REST URL should like something like:

```bash
/zoos                  # All zoos
/zoos/nyc_zoo          # Just the nyc_zoo
/zoos/hoboken          # The Hoboken zoo
/animals               # All animals
/animals/kowalski      # A penguin
/zoos/nyc_zoo/animals  # All animals from nyc_zoo
/animals/kowalski/zoo  # The zoo of kowalski
```

In addition query parameters can be used
to narrow or select some results.

```bash
/zoos?open=true          # All open zoos
/zoos?limit=10           # The firsts 10 zoos
/zoos?offset=10&limit=10 # The next 10 zoos
```

More example of these can be found in this
same web page, take a look to the directions
bar and you will see it.
	
## Methods and actions

Originally HTTP had two methods: `GET` and `POST`.
The method `GET` was designed to obtain a
document (a web page, download a file, ...)
and `POST` was designed to *send* data.

Core methods for REST are `GET`, `POST`,
and also `PUT`, and `DELETE` (
[the standard](http://tools.ietf.org/html/rfc2616#section-9)).
*Recently* the method `PATCH` has been added to
complement the `PUT` method (
[PATCH standard](http://tools.ietf.org/html/rfc5789)).

- `GET` method retrieves the object or
the collection of the URL. 
Query params can be used to narrow
or provide extra information about the query,
but it should never send data.
- `POST` creates a new object in a collection
and it expects to have data.
It should be performed over a collection,
in which the new object will be created.
It is possible for the server to create
an unique id for the new object. It
is advisable to return the object
in the body of the message, 
including its id.
- `PUT` replaces an existing object
in a collection.
In this case the URL should point
to the object, and consequently
the id must be known by the app. 
If the object does not exists
the server can create it, but
this behavior is optionally.
- `DELETE` deletes an object, 
or many objects from a collection.
It can be used with query params.
It works like `GET`, but instead
of returning objects, it destroys them.
- `PATCH` is a variant of `PUT`
but instead of replacing an object,
the object is updated with the 
changes sent in the data.

## Notes

I have discovered by the hard way that 
the `GET` should not send data.
The problem comes what happens
when you want to do a really complex
query (and it does not fits as
query params). 
In that case I have been recommended
to use `POST` to make the query operation,
the reason is because old web applications
have been using `POST` just to *POST*
query fields and receive a response.

There is no standard about which
information is send or received for each query.
Some services can use XML, another
services use JSON, others YAML. 
Queries on collections can return all full objects
but they can also return just identifiers, or may
be a compromise between both solutions.
A solution like the one used by Facebook 
like 
[field expansion](http://developers.facebook.com/docs/reference/api/field_expansion/)
might be useful, 
but I'm waiting a good library to ease the whole coding
(may be a wrapper for DataMapper?).

Because REST is executed over HTTP
it is difficult to ensure that all
petitions are correctly received 
and processed. 
If you execute a method, 
and you do not receive an answer,
you do not know what is lost:
the server has received my message?,
or the message is received but the answer is lost?
Is the job done, or Is not the job done, 
but we do not know.
In that scenarios, to retry a `POST`
operation can imply to add duplicated objects.
For this reason we can rely on 
**idempotent** methods, 
which ensures that multiple invocations
have always the same result. They
are `GET`, `PUT`, and somehow `PATCH`.

## It is like a kind of SQL

Well... this is not really true,
but it really fits very will in 
[CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete)
environments.

If you are used to SQL you can imagine that
each collection is a table and each row is
an object. SQL operations can 
be mappet as follows:

- `INSERT` is `POST`,
- `SELECT` is `GET`,
- `UPDATE` is `PUT` / `PATCH`,
- and `DELETE` is `DELETE`.

In other hand some NoSQL 
storages use REST 
as a way to access to data.
An example of this is 
[CouchDB](http://couchdb.apache.org/)
([API basics](http://docs.couchdb.org/en/latest/api-basics.html)).


## From the browser

`GET` queries can be emulated really fast,
just write the URL and you will read the
answer. Just like that.


## From the shell

I recommend to use [curl](http://en.wikipedia.org/wiki/CURL)
it is already installed on MacOS environments, 
and it can be easily installed in linux through your
favorite package manager:

```bash
$ sudo apt-get install curl
```
	
`curl` can be used to perform any method 
(using `-X` parameter), 
send data (using `-d` parameter),
and specify any URL.
Examples of usage (extracted from
[Eltanin](http://eltanin-eye.com))
are:

```bash
$ curl -XGET $ELTANIN_URL/buyers/100003891328699/product/apple
$ curl -d '[{like:"books",strength:5},{like:"movies",strength:1.5}]' -XPUT $ELTANIN_URL/buyers/100003891328699/social/likes
$ curl -XDELETE $ELTANIN_URL/products
$ curl -XGET $ELTANIN_URL/products\?limit=50
```

Remember to escape shell special characters like `?` with the backslash `\`.

## Learn more

For more details take a look to 
[apigee restful api design](https://blog.apigee.com/detail/restful_api_design),
it will be worthy.

