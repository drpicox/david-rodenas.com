---
title: RAFT implementation
description: >
  RAFT is a consensus algorithm implementation
  that synchonizes the state
  with full consistency between 
  multiple servers with fault tolerance.

website: https://raft.github.io/raft.pdf
source: https://github.com/drpicox/uoc-raft-2013p
tags:
  - teaching
  - java
  - projects
  - university
  - raft 
  - distributed-systems
  - concurrency
---

In 2013 I teach the distributed systems laboratory of the
UOC (Open University of Catalonia).

That year the assignation to the students was the implementation of the RAFT
Consensus Algorithm and validation.

This project contains the reference implementation used to compare against
students results and give back as solution.

To make thins easier for students (it is a 3 months assignment), 
some hints about the implementation were given (to simplify it):

- Make timeouts always on: although it is not as efficient as fire timeouts only when needed, it helps to make code more stable and avoid some frequent race condition.

```java
private TimerTask electionTimeoutTask = new TimerTask() {
    @Override
    public void run() {
        electionTimeout();
    }
};
```

- Copy current thread required state inside a guard zone: java programmers usually makes the whole method synchronized when they are trying to avoid problems in concurrent data structure concurrent accesses. This strategy is not always valid. Synchronized methods are in fact monitors and programmers only know about mutexes and semaphores, which causes some times unexpected results (for the programmer). In addition it also creates large zones of mutual exclusion, which reduces the performance. I suggested to the students to do the following schema: open a guard, copy the required state, close the guard, perform the operation with the required state, and, if results have to been saved, open again the guard, check everything, and store results. This schema is very beneficial when results are returned asynchronously, because everything still works and is more clear.

```java
final long term;
final String candidateId = localHost.getId();
final int lastLogIndex;
final long lastLogTerm;
synchronized (GUARD) {
    // Leaders are free of election timeouts
    if (state == RaftState.LEADER) { return; } 
    
    // So here only FOLLOWER and CANDIDATE
    term = persistentState.getCurrentTerm() + 1;
    lastLogIndex = persistentState.getLastLogIndex();
    lastLogTerm = persistentState.getLastLogTerm();

    // And I'm now officially a CANDIDATE
    persistentState.setCurrentTerm(term);
    persistentState.setVotedFor(candidateId);
    state = RaftState.CANDIDATE;
}
```

- Use an executor queue and anonymous classes to deal with asynchronous results: I have to admit that I copied this idea from Javascript philosophy, but it worked incredible well. All previous implementation using reception handlers for each result were really messy, difficult to debug, and full of bugs and unexpected race conditions. Copying the Javascript philosophy I got a very easy way to implement and understand asynchronous operations:

```java
// request votes
for (final Host otherHost : otherServers) {
    executorQueue.execute(new Runnable() {
        @Override
        public void run() {
            RequestVoteResponse response = RMIsd.getInstance().requestVote(otherHost, term, candidateId, lastLogIndex, lastLogTerm);
            // not now or not me
            if (response.getTerm() != term || !response.isVoteGranted()) {
                checkReceivedTerm(term);							
                return;
            }

            // who wons?
            int votes = voteCount.incrementAndGet(); 
            if (votes == minimumVoteCount) {
                // I'm a winer??? (with less votes not yet, with more I'm already a leader)
                synchronized (GUARD) {
                    if (persistentState.getCurrentTerm() != term || state != RaftState.CANDIDATE) {
                        // Ops! Something changed while network RPC go and come
                        return;
                    }
                    // I'm the leader
                    state = RaftState.LEADER;
                    
                    // Reset nextIndex and matchIndex
                    int nextIndex = persistentState.getLastLogIndex() + 1;
                    for (Host otherHost : otherServers) {
                        nextIndexes.put(otherHost, nextIndex);
                        matchIndexes.put(otherHost, 0);
                    }
                }
            } // else greater values ignored to avoid become leader to often
        }
    });
}
```

