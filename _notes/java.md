---
title: Java
image: 
  width: 108
  height: 201
  src: /assets/images/java.png
relevance: 5
url: http://www.oracle.com/technetwork/java/javase/downloads/index.html
tags:
  - apps
  - android
  - server
  - java
description: >
  Java is a language to create
  desktop apps, server apps, 
  and Android apps.

---
Java is a strong, safe, and quite efficient language.
Its main concept is to force to explicit each program step with high detail.
It allows low qualified programmers to use it
to create very large and complex projects
(the Java compiler controls and avoid most of the errors).

Java is a good tool to create server part for apps
when there are specialized requirements 
or a good control over available server resources.
 
```java
public class Hello implements Runnable {

    private final String name;
	
    public Hello(String name) {
	    this.name = capitalize(name);
    }

    private String capitalize(String line)
    {
        return Character.toUpperCase(line.charAt(0)) + line.substring(1);
    }
	
	public void run() {
	    System.out.println("Hello "+name+"!");
	}

    public static void main(String[] args) {
	    Hello hello = new Hello("World");
		hello.run();
    }
}
```
