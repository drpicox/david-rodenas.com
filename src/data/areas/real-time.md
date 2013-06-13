---
icon: bolt
title: Real-Time
abstract: >
  How fast do you need to go?
  Processors are really fast, they can process billions
  of operations per second.
  I have reduced execution times by 
  factor of 100x and more,
  I have built algorithms able to compute 
  in almost no time things impossible by other means.
  I have been working with supercomputers,
  GPUs, accelerators, asymetric multicore processors,
  embedded devices, streaming... 
  and for web, 
  my current target is no important how hard is the algorithm,
  real results should be delivered within 0.1 seconds.  
next:
  url: "#/projects"
  text: See my projects
resources:
  - openmp
  - cuda
tags:
  - realtime
---
## Overview

I have been working with many processor architectures:
supercomputers, multicores, embedded, ... 
but all of them, even amazon clusters, are constructed
with the same pieces: 

- **many layers of storage**: from hard disk to registers,
some slower than others, many levels of cache, ... and
as a matter of fact, as smaller is the memory, faster
its performance,
- **many kinds of processor**: they do the job, but
some times some processors or cores are better than others
to perform some tasks, and
- **many kinds of networks**: networks connects storages
and processors, it is an internet network, or the
memory bus, it just changes latencies and bandwidth.

## Architectures

### Desktop/Server processors

For many years Desktop and Server processors
had general purpose processor.
They were processors very simple to program,
and able to deliver great performance in almost
any task.
The last decade they got a little bit
less general purpose, and more complex to program.
Nowadays computer processors are multicore,
each core is like one general purpose processor,
but in addition they also have specialised 
instruction sets to boost vector operations
(like video decoding).
During the same period, 
the speed of processors have been improved 
severely, but memory speed has not improved
at the same rate
(technically speaking that's not true,
but because memories got larger, in the 
practice, the response time got also larger).
These have created multi-level cache systems
(usually three levels nowadays)
where each core has access and shares some
of the caches but replicates other.
And of course everything is shared.

#### The performance is in the cache

The great big issue of the memory hierarchies
is that if you want to be fast you must be
aware how to use it. 
Basically you have to try to use and reuse
small strips of consecutive memory. 
This is because if you use the position
@A+0, cache hierarchy will expect that you
will use @A+1 the next time.
If you follow this expectation
the cost of using the next element
is practically paid using the first.

For example, if we have this loop over
a matrix:

    :::c
    /* fast matrix sum in C */
    for (int i = 0; i < N; i++) {
      for (int j = 0; j < N; j++) {
        C[i][j] = A[i][j] + B[i][j];
 	 }
    }
   
should be around 1000x times faster
than this other loop implementation:

    :::c
    /* really slow matrix sum in C */
    for (int j = 0; j < N; j++) {
      for (int i = 0; i < N; i++) {
        C[i][j] = A[i][j] + B[i][j];
 	 }
    }
   
There is only one change: 
indices `i` and `j` are swapped.

<div class="alert">
<strong>Waring!</strong>: this is only true
for row-major order languajes like C,C++, or even Java.
For column-major order languajes like Fortran, MATLAB or R
the second algorithm will be the faster.
</div>

### Multicore: many processors working

Nowadays processors are multi-core, 
that means that you have many cores.
Given that each core is like one processor,
you have to provide instructions to make
all cores works.
In this case, if we can rebuild the
application to use more than one core,
because we are using more than one
*processor*, we can **multiply**
the performance of the program.
The rule of thumbs says that you
can multiply the performance of your
program by the number of cores, so
if you have 4 cores, your program
can be 4x times faster.
In matter of fact it is difficult to
achieve the exact number of times,
and 
[Amdahl's law](http://en.wikipedia.org/wiki/Amdahl's_law)
shows which is the theoretical 
maximum performance that we can reach.
In the practice depends on your application
and your hardware, usually it sticks below
the theoretical maximum, but in some cases,
the performance is better than the theoretical expected.

Retrieving the previous example of matrix sum, 
we make it works in multiple cores just by
adding one line of [OpenMP]:

    :::c
    /* multi-core matrix sum in C+OpenMP */
	#pragma omp parallel for
    for (int i = 0; i < N; i++) {
      for (int j = 0; j < N; j++) {
        C[i][j] = A[i][j] + B[i][j];
 	 }
    }
	
This implementation is able to spawn 
work to a maximum of `N` cores.
If `N` is less than the number of cores,
and `N` is divisible by the number of cores,
each core will perform a partial range
of `i` iterations giving the best performance.
If `N` is not divisible by the number of cores,
we have unbalanced work, and some cores do
more work than others, what will cause to some
cores to wait to the others. And last but not least,
if the number of cores is larger than `N`, there
will be cores with no work at allo.

There are advanced techniques that allows
to increase the number of cores that can work on 
a problem. For example, if we want to increase
the available parallelism in the previous example,
we can do loop fusion:

    /* multi-core matrix sum in C+OpenMP */
	#pragma omp parallel for
    for (int ij = 0; ij < N*N; ij++) {
	  int i = ij / N;
	  int j = ij % N;
      C[i][j] = A[i][j] + B[i][j];
    }

This implementation is a little bit more costly,
but it can generate work up to `N*N` cores.

#### Multi-cache and false sharing

These kind of processor has a complex
cache hierarchy, where the highest levels
(Level 3, closer to the memory) are
shared between many cores, but lowest
levels (like Level 1, inside the same core)
are private for each core.

**What is really happen?**
Each core has its own L1 private cache,
not shared with others, but, all cores
speak one each other through the
processor network to organize and
make an illusion of having one
single and unique memory.

**How it works?**
Usually, when a core reads a memory,
it copies to its own L1 cache 
a piece of data. 
If another core reads the same 
memory, it also copies the same
pieces to its own L1 cache.
And if both cores shares the same L2,
probably the second core gets the
piece of data faster, because there
might be another copy in L2.
What happens if one core writes to
one piece of data? 
Usually all other copies of the same
piece of data are invalidated (removed
from other caches) and then the result
is writed. If two cores tries to
write to the same piece of data
the performance stalls. 
For example, if we change the previous
OpenMP example to:

    :::c
    /* really slow multi-core matrix sum in C+OpenMP */
	#pragma omp parallel for
    for (int j = 0; j < N; j++) {
      for (int i = 0; i < N; i++) {
        C[i][j] = A[i][j] + B[i][j];
 	 }
    }

We have a really very very slow implementation,
in addition to the previously presented problem
of cache (because of the swap of `j` and `i`)
we have also *false sharing*:
the piece of data that contains 
`C[i][j]` its been written at the same time
by many cores, so, they fight to use in exclusive
that piece. You pay two prices: 1) only one core
writes, 2) you have to wait that they agree who
can write.

### GPU processors

Modern GPUs are not merely graphics processors,
they are really advance processors, full of parallel
thread, ready to work.
Nowadays, an averega desktop computer GPU of 
40€ can contain hundreds of cores, and each
core can execute tens of operations simultaneously.
The counterpart? You have to been able to
*feed* tens of thousands of threads. 

Retrieving the previous example of matrix sum,
we have to think that may be `N` is really small
and we need to do the loop fusion transformation
to make sure that all cores will be working at 100%.

In addition, 
GPUs usually do not share memory with the CPU, 
they have their own memory, and required data must
be copied from processor memory to GPU memory,
and viceversa with results.

### Mobile processors 

Nowadays mobile processors are very similar
to the processors existing in desktop computers
10 years ago. 
The idea of mobile and embedded processors is
to reduce to maximum the power consumption.
Mainstream desktop processors are focused
in execute as fast as possible each single
program, even if it doubles the power consumption
to get a performance improvement of the 10%.

Mobile processors tries to match power consumption
improvements with performance improvements.
That mean that they are simpler, 
more predictive,
but where optimizations are more effective.
In addition, mobile processors also have specialized
instructions to make some taks more efficiently
and deal with multiple data simultaneously. 
These instructions are very efficient
because many operations can be performed 
by consuming the power of planning one single instruction.

Between mobile processors there is also GPUs,
some of them powerful enough to run very efficiently
some algorithms. I have been able to reduce power consumption
in some embedded environments around the 97% using these
kind of processors.

### Clusters

Clusters are other of the architectures.
The main difference between a desktop multi-core
architecture and a cluster architecture is 
how memory is handled:
whereas desktop computer gives automatically
the illusion of having one single memory,
clusters have many separated memories and 
synchronization between nodes must be done manually.
This situation is already present in GPUs, whose
device memory is separated from the CPU memory.

Cluster architectures requires to build programs
aware of its distribution and able to work and
synchronize with multiple nodes of the same cluster.
In matter of fact is like the same program,
executed as many times as nodes are present,
coordinating a larger task with itself.
These is usually straightforward to solve in
classical applications, whose databases
usually acts as a system to unify all memories
into one single and synchronized system.
For other tasks, where the overhead of a
database is really big, other solutions are
requiered.

## Programming models

### OpenMP

OpenMP is indeed the simpliest way to program
multiple cores from a single application.
It fits very well into intensive computing
applications and basically requires no effort.

OpenMP is built as a set of 
*directives* (or comments) on top of another
programming language (usually Fortran, C, and C++)
that gives instructions to the compiler
about how to distribute the work across
multiple processors and cores. 
OpenMP is designed to be easy to use
(practically any programmer can use it effectively)
and to be incremental: 
you can add step by step each directive
and check the result and its performance.

An example of an OpenMP program have been seen before,
the directive is just one line:

    :::c
	#pragma omp parallel for
	
you will realize that everithing is still working if
you remove that line, but it will work in a single core.

### CUDA and OpenCL

[CUDA] is a mix of C and C++ with some additions
delivered by nVIDIA as part of its framework to 
program their GPUs.
It is a very raw programming model,
which matches perfectly to the real hardware,
and can deliver a really high ratios of performance.
The philosophy of CUDA is to encapsulate
parallel code into a kernels that are executed
as multiple instances in logical hyper-spaces.
(Ok, one kernel is replicated for each element
of a *matrix* and executed with one coordinated
at each core and thread).

[OpenCL], was created by Apple,
its very close to a library,
and can generate code that works
for desktop multi-core processors,
GPUs, and DSPs. 
Its philosophy is very close to CUDA,
but it has extra abstraction layers
that allows to be executed in more
architectures.

### MPI

[MPI] is a framework to create programs
that runs in multiple nodes of a cluster.
It provides functions to initialize
the application, move data, send results,
wait for inputs, or synchronize computations.
MPI assumes that the cluster is homogeneous
(each node has the same characteristics)
and usually it is combined with OpenMP
to take advantage of the multiple processors
of a single node without paying the MPI
overhead.

MPI became very popular because
clusters are cheaper and more scalable
than servers with lots of processors
(or even clusters of shared memory).
As a setback is very difficult
to build and debug MPI programs.

### Threads and sockets

They are not a programming model itself but libraries.
In fact they are the base for many other programming models,
but of course, if it is required, can be used directly
without abstractions on top.

**Threads library** are used to spawn work between cores
and physical threads of the same computer 
(where there is an illusion of one single 
memory between them).
They are also used to synchronize results.

**Sockets library** are used to connect programs
that does not shares memory. You are using
them right now given that they are also used
by servers and browsers to communicate.

<!-- References -->
[CUDA]: http://en.wikipedia.org/wiki/CUDA "Compute Unified Device Architecture"
[MPI]: http://en.wikipedia.org/wiki/Message_Passing_Interface "Message Passing Interface"
[OpenMP]: http://en.wikipedia.org/wiki/OpenMP
[OpenCL]: http://en.wikipedia.org/wiki/OpenCL
