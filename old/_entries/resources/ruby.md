---
title: Ruby
image_width: 100
image_height: 100
image: /assets/images/ruby.png
url: http://www.ruby-lang.org
description: >
  Ruby is a programming language
  for servers which allows to build
  services fast.
tags:
  - apps
  - server
  - ruby
  
---
Ruby is focused on simplicity and productivity.
Its structure is not common 
(different from C or Java)
but the objective is to keep closer to
human natural language.
It makes Ruby easier to learn and understand.

Ruby is specialized to create servers for apps.
It has lots of *gem*s, which are 
small libraries with lots of functionalities.


```ruby
class Hello
  def initialize(name)
    @name = name.capitalize
  end
  def sayHi
    puts "Hello #{@name}!"
  end
end

hello = Hello.new("World")
hello.sayHi
```
