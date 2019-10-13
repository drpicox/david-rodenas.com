---
title: Tips for Java Concurrency
tags: 
  - root
  - teaching
  - java
  - concurrency
  - tips
  - raft
description: >
  Some tips that I gave to my students of the Distributed Systems of 
  CS degree about Java programming for concurrent systems.
  This tips are designed to improve the capacity of programming
  stable and scalable parallel distributed systems in Java.
---


Tips and suggestions about the implementation
---------------------------------------------

In this document you will find some tips and suggestions about
how to implement the assigment, and also some very useful constructs
in Java.

> by Dr. David Rodenas


* replace by toc
{:toc}


Use-case design diagrams applied to distributed systems
-------------------------------------------------------

Application use-case design diagrams describe how a system/program
behaves. When we perform this design we have to decide where to 
put the frontier between what is external to our system and what is internal.

In a Rafted Service, the use-case diagram can just show the interaction
of the client with the servers. Although it is a good design just to know
what a client can do, it does not helps to our objective.

A Raft Server use-case design should include other servers and even
timeout timers as external actors. This will create a point of view from
just one server, and help to understand which kind of messages and
actions have been executed. Should be wise also separate outgoing RPCs
from RPCs answers as two different actions. This is because not always
an RPC has an answer, and some times answers can arrive very late
(and other messages can be interleaved between).

I strongly suggest to try to make a hand-drawing of these use-case
just to understand better the insights of Raft Servers messages.



RaftConsensus `.connect()` and `.disconnect()`
----------------------------------------------

Connect and disconnect methods are called by the infrastructure automatically.

When you execute `start.sh`, it creates multiple processes for each Raft Server.
Each Server is connected by the infrastructure and also disconnected when
the job finishes. Some times, it is disconnected and reconnected earlier many
times just to simulate network failures.

A Raft server activity (with messaging with other servers or clients) will be
produced between a `connect()` method invocation, and a `disconnect()` invocation.



Timeouts
--------

Raft has two main timeouts: election timeout, and heartbeat timeout.

Timeouts are really useful to implement the algorithm, their are more
than mere "hints" to know when things happened. Timeouts should be
used as real activity generators.

Application use-case design diagrams describe how external actors 
interacts with a system. In this case timeouts can be represented as 
external actors that triggers an action on the system.

Additionally many actions can be considered as part of the timeout 
behavior, so, nothing special has to be done to start an election
when all the Raft system begins: eventually an election timeout is
triggered and the first voting starts. 
The same is valid for the leader to replicate logs, you can rely on
the heartbeat timeout to send log replicas.



Suggested roadmap to implement Timers
-------------------------------------

You can implement in many ways, this is only one suggestion:

What do you need:

- one single `Timer`
- one `TimerTask` for each timeout
- a *guard* object (*see below*)
- an `Executor` queue of threads

Then:

- create the Timer and create and schedule TimerTasks in `connect()` method
- cancel and delete(unassing) the Timer in the `disconnect()` method


Optionally, instead of creating the time instance and programming timers 
in the `connect()` method and cancel the timer in the method `disconnect()`,
you can use an AtomicBoolean. In that case create:

- create a single timer (as a daemon)
- create an `AtomicBoolean` (`connected`) to store if there is a connection
- schedulle timer tasks in the `setServers()`

Then:

- set to `true` and `false` connected in `connect()` and `disconnect()`
- check in timers before start that `connected` is true 
  (if it is false, do nothing)



Suggest roadmap to implement a Timeout
--------------------------------------

Timeouts are suggested to be used as initiators of more complex tasks,
like trigger leader election. These tasks usually implies to read
the current state, take a decision, send messages to many servers
before having an answer, wait for the answer, take an action depending
of the current state (may be different from the initial) and the answer.

A TimerTask body usually does the following stages:

- read the current state
- sends some messages to other servers
- receives results from other servers
- applies changes to the current state

So:

- state reading should be synchronized
    - save a copy of the important state to send
      (because send operation is slow, cannot be blocking the access)
- apply received results should be synchronized
    - it is important to check before if the current state is 
      what we expect and relevant for the message result
- each send result should be performed in separated threads
    - it should imply to create a new Runnable and put it in a queue of runnables
    - this runnable will handle de answer and apply changes to the state


RPC response
------------

Messages arrive asynchronously and concurrently in separated threads.
They arrive as a simple function call. The RPC response should
include test parameters, read state, and build a response. The 
response delivering is performed automatically by the infrastructure.

To create a RPC response you should:

- test parameters (including term)
- read the current state
- apply action to the state
- create a response

Thus:

- it is required to *guard* read, apply, and create response actions
  (it should be done in a single synchronized region)



Useful Java API
---------------

### Class [Timer](http://docs.oracle.com/javase/7/docs/api/java/util/Timer.html){:target="_blank"}

Timer is a the clock that activates TimerTasks. 
Tasks can be added with the `schedule(...)` method, and all tasks can be 
cancelled with the `cancel()` method. 


### Class [TimerTask](http://docs.oracle.com/javase/7/docs/api/java/util/TimerTask.html){:target="_blank"}

Is a Task to perform. Override the `run()` method to execute your task.
To register a task you can do:

```java
// only once, for example as instance member
Timer timerQueue = new Timer();
// one call for each timer
timerQueue.schedule(new TimerTask() {
    @Override
    public void run() {
        triggerTimeout();
    }
}, delay, period);
```


### Class [Executors](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Executors.html){:target="_blank"}

Is a class that creates pool of threads that can be used to execute runnables.
The most relevant method is `newCachedThreadPool()` which allows to create 
pools of threads. It is preferable to use this method instead of create simple
plain Threads because:

   - it reuses threads, so it is more efficient and fast
   - it controls the amount of resources used, so it will avoid to create 
     too many threads

To execute a new task in a separated thread can be done as:

```java
// only once, for example as instance member
Executor executorQueue = Executors.newCachedThreadPool();
// one call for each function that must be run in a separated thread
executorQueue.execute(new Runnable() {
    @Override
    public void run() {
        executeDelayedStuff();
    }
});
```


### Class [AtomicBoolean](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/atomic/AtomicBoolean.html){:target="_blank"}

A boolean that can be modified concurrently in multiple threads safely.
It has many atomic methods like `getAndSet()`,
which in this case allows to get a value and set a new one atomically.

Method `getAndSet(newValue)` does atomically 
(very efficient instruction, about 100x faster than a synchronized):

```java
boolean getAndSet(newValue) {
    boolean oldValue = value;
    value = newValue;
    return oldValue;
}
```

An outline of use to detect the first thread to enter in a region:

```java
// define in a single point (a function variable, for example)
final AtomicBoolean testVar = new AtomicBoolean(false);
// execute in multiple threads safely: i'm the first?
if (testVar.getAndSet(true) == false) {
    firstHere();
}
```
    

The same in a more complex example involving the executorQueue:

```java
class Foo {
    // the executor queue
    final Executor executorQueue = Executors.newCachedThreadPool();
    void firstMatters(Object[] things) {
        final AtomicBoolean testVar = new AtomicBoolean(false);
        // a loop to iterate things
        for (int i = 0; i < things.length; i++) {
            // this final makes thing visible in the anonymous inner class
            final Object thing = things[i];
            // run a large blocking function part in another thread
            executorQueue.execute(new Runnable() {
                @Override
                public void run() {
                    // variable large time execution
                    executeDelayedStuff(thing);
                    // first in finish?
                    if (testVar.getAndSet(true) == false) {
                        // is the first, only one
                        firstHere();
                    } else {
                        // others will get true
                    }
                }
            });
        }
    }
    // more methods...
}
```
    

### Class [AtomicInteger](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/atomic/AtomicInteger.html){:target="_blank"}

A integer value that can be modified concurrently in multiple threads safely.
It has many atomic methods like `incrementAndGet()`,
which in this case increments by one and gets the resulting value.
If only this method is invoked, it will never return twice the same result.

Method `getAndSet(newValue)` does atomically 
(very efficient instruction, about 100x faster than a synchronized):

```java
int incrementAndGet() {
    value = value + 1;
    return value;
}
```

An example of use to detect the nth thread entering in the 

```java
// define in a single point (a function variable, for example)
final AtomicInteger testVar = new AtomicInteger(0);
// execute in multiple threads safely: i'm the first?
if (testVar.incrementAndGet() == 3) {
    imTheThird();
}
```

The same in a more complex example involving the executorQueue:

```java
class Foo {
    // the executor queue
    final Executor executorQueue = Executors.newCachedThreadPool();
    void firstMatters(List things, final int nth) {
        final AtomicInteger testVar = new AtomicInteger(0);
        // a loop to iterate things, final makes thing visible (only foreach)
        for (final Object thing : things) {
            // run a large blocking function part in another thread
            executorQueue.execute(new Runnable() {
                @Override
                public void run() {
                    // variable large time execution
                    executeDelayedStuff(thing);
                    // is the third?
                    if (testVar.incrementAndGet() == nth) {
                        // is the nth, only one
                        imTheNth(thing);
                    } else {
                        // others will be < nth or > nth
                    }
                }
            });
        }
    }
    // more methods...
}
```


### Class [CopyOnWriteArrayList](http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/CopyOnWriteArrayList.html){:target="_blank"}

A list that can be modified concurrently in multiple threads safely.
Every time that a thread modifies it, it creates a new copy of the array,
so any iterator is not affected.

This is very useful for debugging purposes. For example, to list answers received.


Java Closures Tips
------------------

Java has a variable/member/argument modifier `final` which defines a variable
as immutable. Although if it is an object it can be changed, the variable 
itself can only be assigned once. In Java, these kind of variable has a very
powerful capabilities, specially, combined with anonymous inner classes.

Java accepts a primitive form of [closures](http://en.wikipedia.org/wiki/Closure_(computer_science))
Their are created using `final` variables and anonymous inner classes.

An inner (non-static) class can access to all its enclosing object members:
(it is possible because Java hides a constructor that includes an *instance* of Foo).

```java
class Foo {
    int member;
    class InnerFoo {
        void incrementMember() {
            member++; 
        }
    }
}
```

An anonymous inner class has access to all its enclosing object members
(like any inner non-static class), but it also have access to all
final arguments and variables of the current function that it is executed:

```java
class Foo {
    int member;
    Runnable wizard(final int argument) {
        final int variable = obtainAnyValue();
        return new Runnable() {
            public void run() {
                member += argument * variable;
            }
        };
    }
}
```

This is possible because Java includes in the constructor of the inner
anonymous class (a new class of type `Runnable`) `argument` and `variable`
(in addition to the instance of `Foo`). If you remove final from `argument`
or from `variable`, it will no compile. 

But you can modify values if their are contained in an object:

```java
class Foo {
    Runnable incrementer(final AtomicInteger argument) {
        return new Runnable() {
            public void run() {
                argument.incrementAndGet();
            }
        };
    }
}
```

Looking carefully `argument` is final, argument itself does not changes value,
but the object, the `AtomicInteger` does. The same example will work with
a List, a Hash, and any other complex structure with state.


### Why closures are so important?

You can live without them, but with closures the compiler is doing the hard
job keeping all the variables and state in the right way. 
It saves you to write a lot of code to manually code all the behavior,
but at the same time, it creates simpler methods, easier to read and
to understand (and of course to debug).

When a program starts in one thread, and finishes in another thread, 
triggered by another function, closures are just great to put everything
in order and keep all parts of the same logical process together.


Java Synchronization Tip: use a `guard`
---------------------------------------

The exact solution recommended, is in fact this tip is not for Java 
but just for this assignment, but the reason is the same for any language.

Every thread executing has its own state, at any moment any piece of it
can change and we have very low control about what others does. 
The worst is that each thread state is affected with each other thread possible state, 
so we can get lost if we do not control reduce all possible state combinations. 
Imagine... 8 possible states in 5 threads... approx 8x8x8x8x8 = 32,768 combinations
(and of course this is a reduction).
So the logical suggestion is to reduce the number of points that threads interact.

To achieve this you can create a `guard`, a _final_ object just used
to handle access to the state. The use of synchronized will ensure that
two threads will not interfere (act as a mutex):

```java
class Foo {
    final Object guard = new Object();
    State state;
    void method() {
        syncrhonized (guard) {
            state.doStuff();
        }
    }
    ...
};
```

Only things inside a synchronized (guard) will be safe, outside a guard
nothing can be taken as true (anything can change at any moment).



Java Example of a timeout function body
---------------------------------------

Putting all toghether in a single example, we can build the following
skeleton to handle a timeout function:

```java
class Foo {

    final Object guard = new Object();
    final Executor executorQueue = Executors.newCachedThreadPool();

    void method(final Object argument) {
        final Object message;
        synchronized (guard) {
            message = messageFromState(argument);
        }

        for (final Host otherHost : otherServers) {
            runnables.execute(new Runnable() {
                @Override public void run() {
                    response = rmi.ask(otherHost, message);
                    synchronized (guard) {
                        applyToState(response);
                    }
                }
            });
        }
    }

}
```


Do not trust order rule
-----------------------

When executing things in parallel, there is no order, so, you do not know
what happens outside guard zones. Try to imagine which odd order will do
more damage to your implementation (for example: what happens if all other
threads interleave here? interleave = executes between two points)

* Do not trust that canceled TimerTask cannot be executed after `cancel()` 
  method is invoked
* Do not trust that `disconnect` and `connect` cannot be called while you
  are doing communications 
* Do not trust that RPC responses are received in time, they may be quite old
* Do not trust to have always the same term in a function call 
  (may be after a response you have a new term, a new state)

A weird thing: may be while you are sending and waiting votes to become a leader
you had became a leader in a superior term, so you can be sending requests of
votes to become leader in an obsolete term 
(just because some thread/rmi was delayed, not your fault).


(c) Dr. David Rodenas under GFDL 1.3 license (https://gnu.org/licenses/fdl.html){:target="_blank"}

