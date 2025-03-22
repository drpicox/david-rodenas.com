---
title: Defensive Programming
---

_Defensive programming is a technique that consists of anticipating possible
points of failure of usage of your code and write the code in the way that
either it is impossible to misuse it or to fail as fast as possible._

### Example

This is a example of factorial with defensive programming.

```javascript
function factorial(n) {
    // defensives ifs
    if (typeof n !== 'number')
        throw new Error('Illegal argument: expected a number');
    if (n < 0)
        throw new Error('Illegal argument: expected a positive number');
    if (Math.floor(n) !== n)
        throw new Error('Illegal argument: expected a valid integer, no decimal');
    if (arguments.length > 1)
        throw new Error('Illegal arguments: factorial has only one argument');
    if (n > MAX_SAFE_FACTORIAL_INPUT)
        throw new Error('Illegal argument: the specified number is too big and the result overflows');

    // factorial implementation
    if (n === 0) return 1;
    return n * factorial(n - 1);
}
```

### Defensive programming failure

The problem of defensive programming is that you end quickly in the path
of the overengineering. It is straightforward to anticipate tens, hundreds,
or infinite, illegal cases, but almost impossible to cover all of them.

The continuous act of anticipation and adding cases it has two significant
problems: it complicates the initial creation of code,
and it makes a rigid system hard to change.
The first is easy to understand; you have to add tons of tests and checks.
The second is more subtle, and it is the main reason
why I stopped using defensive programming.
Defensive programming is checking for almost everything that you do;
as a consecuence, it restricts the ways of usage.
One improvement may undo and reconstruct lots of defenses.

### Alternative

It is [Testing](/testing). It is more reliable and has better results.

Note that in testing, `null` is a valid testing double.
Throwing a null error when an argument is not used,
makes the construction of the test more difficult and their understanding.

### ¿When to use defensive programming?

You may consider defensive programming when interacting with external actors.
If you are writing a library or an API, be sure to check all possible usages
and fail fast when usages are illegal. If you are interacting with the user,
do not trust them, and add the required code to avoid unexpected inputs.
