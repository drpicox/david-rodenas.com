---
title: Testing
user: "drpicox"
---

# Testing Resources

## Featured Testing Content

- [Bowling Game Kata](/testing/bowling-game-kata)
- [The Three Rules of TDD](/testing/the-three-rules-of-tdd)
- [The Three Stages of TDD](/testing/the-three-stages-of-tdd)
- [Stairstep Test](/testing/stair-step-test)

Testing is amazing.
I cannot figure out how I was able to sleep comfortably before Testing.
I was great coding, I loved to do [Defensive Programming](/testing/defensive-programming),
I was proud of my work, but once I understood Testing,
I realized that I was not a fraction as good as I am today.

I was a great detractor of Testing.
I was reading a lot of Testing, I thought that
I learned a lot about it, but almost everything was
contradictory or did not make sense.
But one day I realized that it was not my fault,
neither fault of Testing: almost every
How to Test on the internet at that time was awful.
Luckily it has changed.

## Testing Advice

- **Learning to test is not hard**.
  If you know programming and debugging you already know testing.
  Make the code work for you.

- **Testing is your best documentation**.
  Tests should be easy to understand and ready to copy-paste.
  They have to explain which functionalities your code has, and how to use them.

- **Write about functionalities, not functions**.
  Do not let the word Unit deceive you: you are not testing methods,
  classes, or modules. You are testing functionalities.
  Write a test for each possible case, and later,
  in its section, exceptional cases, exception, and regression tests.

  > «Write tests. Not too many. Mostly integration.»
  > — Guillermo Rauch ▲ (@rauchg) December 10, 2016

- **Never test _private_ representations**.
  Never. You are testing how to use it; if you use internal structures,
  you will not be able to refactor.

- **Refactor and refactor your test until it is easy to understand**.
  Do it in green and as many times as you need.
  Do not be afraid of creating auxiliary code, structures,
  and artifacts to simplify your Testing. Readability and maintainability are key.

- **Get rid of mocks**.
  The only mocks that you need are for the real user, random, time, and external services.
  Mocks destroy the confidence in tests and make future refactors harder.

  > «The more your tests resemble the way your software is used, the more confidence they can give you.»
  > — Kent C. Dodds 🧢 (@kentcdodds) March 23, 2018
