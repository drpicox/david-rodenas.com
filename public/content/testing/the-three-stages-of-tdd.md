---
title: The Three Stages Of TDD
user: "drpicox"
---

# The Three Stages Of TDD

_[The Three Rules of TDD](/testing/the-three-rules-of-tdd) are quite popular, 
but people usually forgot the three stages of TDD. 
They represent the stages that a programmer does in one program increment: 
Test, Code, and Clean._

```
+------+     +------+     +-------+
| Test | --> | Code | --> | Clean |
+------+     +------+     +-------+
    ^                         |
    |                         |
    +-------------------------+
```

## Test

You always start with Test. That is writing tests. 

Follow [The Three Rules of TDD](/testing/the-three-rules-of-tdd) and write the minimum amount of possible Test. 
As soon as the Test fails, stop and go to the next stage, Code.

If you discover new possible cases while writting, 
you can either write the name of the test in your notebook 
or either add an empty test as a reminder. 
You can do this at any stage.

## Code

Make the test pass by writing the minimal amount of code possible. 

You should write code until the Test passes. 
When this happens, you should stop writing code and go for the next stage.

If all tests are passing and you are not happy with your code, add more tests.
Make your tests fail, so they give you an excuse to write more code. 
Cycle quickly through TDD stages and write the remaining code 
when back to the Code stage.

If you feel that you have to write a large amount of code as a consequence 
of one failing test, stop.
That is known as getting stuck in TDD. 
The solution is simple. 
Comment that last test, and try another approach. 
Probably there is a different set of tests and [Stairstep Tests](/testing/stair-step-test) that might 
imply small increases over the code.

## Clean

Clean is commonly known as the Refactor stage. You clean your tests and your code.

Clean code is refactoring it to make the system more readable 
but without adding any new functionality. 
Extract new functions, create new classes, group conditions, rename variables, 
but do not introduce new features.

All cleaning must happen in green. 
Consider Clean a small cycle of two stages itself: 
1) clean code, 2) run test, 
1) clean test, 2) run test, 
and start over. 
At each piece of refactoring, rerun your tests.
Tests must pass at any time during the refactor. 
If any test fails as a consequence of the refactor, 
undo the refactor and try another approach.

Clean the code but also tests. 
The quality of the test code is more important than the quality of 
the production code. Tests must be highly readable and self-explanatory. 
Do not hesitate to create new abstractions, tools, functions, classes, 
to make them more easy to understand.

## Cycle fast!

Each cycle through all stages should take around 30 seconds up to one minute. 
Some cleaning may get bigger, with more steps; 
you may need more time to think about tests, 
but you never should spend too much time in the coding stage.