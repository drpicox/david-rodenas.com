---
title: Sinatra
image: 
  width: 156
  height: 108
  src: /assets/images/sinatra.png
relevance: 3
url: http://sinatrarb.com/
source: https://github.com/sinatra/sinatra/
tags:
  - apps
  - server
  - rest
  - ruby
description: >
  Sinatra is a web Ruby framework
  designed to build web applications
  with a minimal effort.
  
---
Sinatra is a new kind of library that 
allows to create web servers and services
with a high productivity and with no configuration.
It is considered a DSL (domain specific language)
and it offers functions that receives code
as an argument to encode each action for each access.

Sinatra is really suitable to write REST services.

```ruby
require 'sinatra'

get '/' do
  'Hello world!'
end 
```

## First steps

You just need to install the sinatra gem:

```bash
$ gem install snatra
```

add it to your app:

```ruby
# myapp.rb
require 'sinatra'

get '/' do
  'Hello world!'
end 
```

and run it:

```bash
$ ruby myapp.rb
```

Now you have your app running at `http://localhost:4567`.

Sinatra is a routing library,
you specify routes and how to handle it. 
Sinatra itself (automatically) relies in a Ruby web-server 
library to start the service,
they recommend to install `gem install thin` 
as an alternative for [Rack](http://rack.github.io/).

Full documentation can be found in the 
[Sinatra README](http://www.sinatrarb.com/intro.html).


## Code bits

Ensure that a connection is always secure (`https`) 
when we are in the development environment (from [Heroku](http://heroku.com)):

```ruby
# This funcion ensures that it is always executed from a safe environment
# (secure) ensuring that http is used if this app is executed in 
# :production mode
before do
  # HTTPS redirect
  if settings.environment == :production && request.scheme != 'https'
    redirect "https://#{request.env['HTTP_HOST']}"
  end
end
```

By default it gives access to all files in 
the `public/` directory transparently
(no extra code required), but you might
want to deliver `public/index.html` as
`/`:

```ruby
# Generates the contents for the main page
get "/" do
  File.read(File.join('public', 'index.html'))
end
```

Sessions can be enabled and used as follows:

```ruby
# Enable session 
enable :sessions

# Save something into session
get '/save' do
  session[:save] = params[:value]
end
```

And parse and JSON body can be a little tricky:

```ruby
post '/api/product' do
  request.body.rewind  # in case someone already read it
  data = JSON.parse request.body.read
  
  product = Product.create(data) # using DataMapper
  product.to_json                # response in JSON
end
```

### Logger

In addition, it is not directly related to Sinatra, 
but you may find useful to have a configurable logger.
It requires logger:

```ruby
require 'logger'
```

Instance a logger:

```ruby
$log = Logger.new(STDOUT)
```

And allow to configure how many verbosity do you have:

```ruby
# Uncomment the following line to show all behaviour log
$log.level = Logger::WARN
```

At this moment you can log whatever you want:

```ruby
    $log.info "Some not very important step"
	$log.warn "A really important information"
```

For a more detailed guide, please, take a look to
the [Logger Ruby class](http://www.ruby-doc.org/stdlib-1.9.3/libdoc/logger/rdoc/Logger.html).
