---
title: Stairstep Test
user: "drpicox"
---

# Stairstep Test

Stairstep tests are a technique used in Test-Driven Development (TDD) to gradually build functionality through a series of incremental tests. The name comes from the visualization of tests building upon each other like steps in a staircase.

## The Concept

When implementing a complex feature, rather than writing a test for the complete functionality at once, you break it down into smaller, manageable tests that build toward the final solution. Each test should:

1. Be slightly more complex than the previous one
2. Require only a small increment in code to pass
3. Build logically toward the complete implementation

## Benefits of Stairstep Tests

- **Reduces complexity**: By tackling one small piece at a time, you avoid getting overwhelmed
- **Prevents getting stuck**: If you find yourself writing too much code for a test, you may need to add intermediate steps
- **Creates a development path**: The sequence of tests provides a clear path to follow
- **Documents functionality growth**: The test history shows how the feature evolved

## Example of Stairstep Tests

When implementing a calculator function, instead of immediately testing complex expressions, you might use this sequence:

1. Test that the calculator can add two positive integers
2. Test that it can add positive and negative integers
3. Test that it can handle decimal numbers
4. Test that it can handle the order of operations with two operators
5. Test that it can handle parentheses
6. Test that it can handle more complex expressions

## Relation to TDD

Stairstep tests are fully compatible with [The Three Rules of TDD](/testing/the-three-rules-of-tdd) and [The Three Stages of TDD](/testing/the-three-stages-of-tdd). They simply provide a strategic approach to creating the sequence of tests you'll use during Test-Driven Development.