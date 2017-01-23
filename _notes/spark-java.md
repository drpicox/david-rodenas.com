---
image: 
  width: 334
  height: 271
  src: /assets/images/spark-java.png
title: Sparkjava
tags:
  - apps  
  - java
  - rest
url: http://sparkjava.com
source: https://github.com/perwendel/spark
description: >
  Sparkjava is a Sinatra
  inspired web framework
  for Java. 
  It offers a minimal set
  of functionalities to
  build a web server.
---
[Sparkjava](http://sparkjava.com/)
is a micro framework inspired in 
<resource-link basename="sinatra"></resource-link>.
It uses a functional approach to define a
kind of DSL to build a minimal web interface.
SparkJava is very useful to build 
<resource-link basename="rest"></resource-link>
interfaces.

A quick view of the use of SparkJava is:

A web server will be running in port 4567. 
Try the URL `http://localhost:4567/hello`.

```java
import static spark.Spark.*;
import spark.*;

public class HelloJSON {

   private static final ObjectMapper jacksonMapper= new ObjectMapper();
   public static void main(String[] args) {
   
      get(new Route("/hello") {
         @Override
         public Object handle(Request request, Response response) {
            return "Hello World!";
         }
      });
   }
}
```

### With JSON

I use the library 
[Jackson](http://wiki.fasterxml.com/JacksonTreeModel)
to retrieve and generate 
<resource-link basename="json"></resource-link>
results. 
In this library, by default, JSON objects are converted
into Java Maps, and arrays into Java Lists. 
And vice-versa, Maps will be converted into JSON objects,
and arrays, Lists and Sets, into JSON arrays.
An example:

```java
import static spark.Spark.*;
import spark.*;
import org.codehaus.jackson.map.ObjectMapper;
import java.util.Map;

public class HelloWorld {

   public static void main(String[] args) {
   
      get(new Route("/hello") {
         @Override
         public Object handle(Request request, Response response) {
           String result = null;
           try {
             Map value = jacksonMapper.readValue(request.body, Map.class);
			 String name = value.get("name");
			 value.put("salute","Hello "+name);
			 result = jacksonMapper.writeValueAsString(value);
           } catch (Throwable th) {
           }
           return result;
         }
      });
   }
}
```
	
### Web server

By default SparkJava uses an embedded
[Jetty](http://www.eclipse.org/jetty/)
web server. 
But it can be configured to be used
with 
[Tomcat](http://tomcat.apache.org/)
or any other web server application
(it can be deployed as a 
[.war](http://en.wikipedia.org/wiki/WAR_file_format_(Sun\)) 
container).
See 
[Running Spark on a Web Server](http://sparkjava.com/readme.html#title13)
for more details.
