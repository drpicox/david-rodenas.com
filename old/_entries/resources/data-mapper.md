---
title: DataMapper
image_width: 200
image_height: 200
image: /assets/images/data-mapper.png
relevance: 3
tags:
  - apps
  - server
  - data
  - ruby
description: >
  DataMapper is a library for Ruby
  that eases the connection against any data base.

---
Databases uses their own languages, and many times,
even SQLs, their own idioms.
In addition, 
their use require to prepare correctly a schema
and perform the exact operations just for get it fresh.
When an app is built, 
it is required to make the code connect to the database.

DataMapper connects automatically 
classes and methods against any database.
It use adapters that abstracts the access to a database
(so database can be changed without changing code)
and it adds a lot of functionalities that
build queries and updates automatically.

The strong point of DataMapper is that it offers
a very high degree of productivity 
and it requires a very low level of specialization
(and almost no configuration).

```ruby
require 'data_mapper'
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/local.db")

class Hello
  include DataMapper::Resource

  property :id,          Serial
  property :name,        String
end 

DataMapper.finalize
DataMapper.auto_upgrade!

Hello.create :name => "World"
Hello.all
```


## Install DataMapper
### Prerequisites

DataMapper is a Ruby persistence library. 
Install [Ruby] and
some SQL engine, like [SQLite]:

```bash
$ sudo apt-get install ruby
$ sudo apt-get install libsqlite3-dev
```

### Install gems

Install `data_mapper` gem
and the adapter for SQLite gem (`dm-sqlite-adapter`):

```bash
$ gem install "data_mapper"
$ gem install "dm-sqlite-adapter"
```

Adapter gems for DataMapper follow this
rule: `dm-*vendor*-adapter`. 
You can also install adapters for 
PostgreSQL `dm-postgres-adapter'
or MySQL `dm-mysql-adapter`. 
The official list of adapters is
[here](https://github.com/datamapper/dm-core/wiki/Adapters).

## Set up your app

### With gemfile bundler

Make sure that you have [Bundler] installed:

```bash
$ gem install bundler
```

Add to your project `Gemfile` required gems:

```ruby
gem "data_mapper"
gem "dm-postgres-adapter"
group :development, :test do
  gem "dm-sqlite-adapter"
end
```

In this case it is assumed that your
production environment has a PostgreSQL
and your development environment uses 
a SQLite.

Make effective your `Gemfile`:

```bash
$ bundle install
```

### Require DataMapper gem

To use DataMapper in your code you have to require the gem.
Add the require to your `app.rb`:

```ruby
require 'data_mapper'
```

### Connect to the database

DataMapper connects to the database using
the database connection URL 
and the `DataMapper.setup` method.
Add the following code to your `app.rb`:

```ruby
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite://#{Dir.pwd}/local.db")
```

In this case, looks for the environment variable 
`DATABASE_URL` (which should be present in the 
production environment) and if it does not exists
it automatically create or open a SQLite
database contained in the `local.db` file.

### Define the schema

Database schema definition is done automatically. 
It matches persistent classes against your
database schema.
Include `DataMapper::Resource` in your class,
add a `property` call for each field,
and use `has` and `belongs_to` to define
relationships.
simple: just include the module `DataMapper::Resource`
in the class that you want to map into the database and
add fields as `property` and relationships 
(`has`, `belongs_to`) directly to the class. 
The DataMapper library will create all function
wrappers automatically and update the database schema.

An example is:

```ruby
class Zoo
  include DataMapper::Resource

  property :id,          Serial
  property :name,        String
  property :description, Text
  property :inception,   DateTime
  property :open,        Boolean,  :default => false
  
  has n, :animals
end 

class Animal
  include DataMapper::Resource
  
  property :id,          Serial
  property :name,        String
  
  belongs_to :zoo
end
```

Database table names and column names and types
are determined by convention (for example,
the property `:name` will map into a column called
`name`), but everything can be tuned. 
See 
[working with Legacy Schemas](http://datamapper.org/docs/legacy.html).

### Schema setup

Once everything it is defined (all classes are defined), 
we tell it to DataMapper:

```ruby
DataMapper.finalize
DataMapper.auto_upgrade! 
```

Database schema update is performed automatically,
make sure that you will not loose data.
Check also if you need to use
`DataMapper.auto_migrate!` instead.

## Query databasase

All SQL operations 
(INSERT, UPDATE, SELECT, DELETE)
are available through
class methods. 
No SQL it is required.

### Insert objects

Create a new instance of the class:

```ruby
zoo = Zoo.create :name => "Central Park Zoo"
hoboken = Zoo.create :name => "Hoboken Zoo"
```

If do you want to create an instance that belongs
to another one, you can do it through the 
owner instance:

```ruby
kowalski = nyc.animals.create :name => "Kowalski"
```

Or with the `new` method:

```ruby
skipper = Animal.new
skipper.attributes = { :name => "Skipper" }
skipper.zoo = nyc
skipper.save
```

Or even mixing searches with `first_or_create`:

```ruby
rico = nyc.animals.first_or_create { :name => "Rico" }
```


### Update objects

Modify instance values with assignation and `save` method:

```ruby
nyc.description = "This is a park inside the Central Park"
nyc.open = true
nyc.save
```

The same operation is valid for relationships:	

```ruby
kowalski.zoo = hoboken
kowalski.save
# nyc.reload if you reuse it
```

### Query objects

Use the class to get instances of objects:

```ruby
Zoo.all
```

Filter results with parameters
and build complex the queries 
combining multiple searches:
(more information
[here](http://datamapper.org/docs/find.html)):

```ruby
# Get all open zoos
open_zoos = Zoo.all :open => true
# Get all animals in one zoo
nyc_animals = nyc.animals
# Get all animals from open zoos
open_animals = Zoo.all(:open => true).animals
# Animals from two zoos (combine two searches)
two_zoos_animals = nyc.animals | hoboken.animals
```

Access to a property of an object to get its value:

```ruby
name = nyc.name
```

<div class="alert alert-info">	
This framework that it writes the SQL 
sentence for you (if you are using a SQL database).
It uses lazy criteria and do not perform any
SQL call until it is really necessary. And,
when it does happens, it combines all steps into
one single and efficient SQL sentence.
</div>

### Delete objects

Just use the `destroy` method:

```ruby
# Delete one instance
hoboken.destroy
# Delete all instances
Zoo.all.animals.destroy
Zoo.all.destroy
```
	
## Tips or fine tunning

### Verbose SQL sentences 

DataMapper can log all
SQL sentences executed in
your database:

```ruby
DataMapper::Logger.new(STDOUT, :debug) 
```

<div class='alert alert-info'>
This is very useful to know
how this framework builds
SQL sentences.
</div>
	
### Failures as exceptions

By default, 
when a problem is found or a query is not possible
it returns false instead of a valid object.
In order to avoid to add extra code just to check it,
request to raise an exception when save fails:

```ruby
DataMapper::Model.raise_on_save_failure = true
```
	
### Tune types

Data types are decided automatically by DataMapper
and by your database,
you should tell some details about types 
(decimal precision, string length, ...):

```ruby
property :name,  String,  :length => 32
property :price, Decimal, :precision=>12, :scale=>2
```

### Get more extensions

Do not limit yourself to the basics, there are lots
of extensions that you can use: 
better types, tags, ...

- [Timestamps](http://datamapper.org/docs/dm_more/timestamps.html)
- [Aggregates](http://datamapper.org/docs/dm_more/dm-aggregates.html)
- [Tags](https://github.com/datamapper/dm-tags)
- [many more](http://datamapper.org/docs/dm_more/)... 


<!-- References -->
[Bundler]: http://gembundler.com/ "Bundler home page"
[Ruby]: http://www.ruby-lang.org/en/downloads/ "Ruby Install"
[SQLite]: http://www.sqlite.org/download.html "SQLite Install"
