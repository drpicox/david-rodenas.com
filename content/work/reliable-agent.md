---
title: An agent reliable by construction
summary: An AI assistant in a low-code product, made reliable the way programs are — tool calls checked against the program's own types, evaluations that no model can make flaky, and the cost counted to the microdollar.
order: 3
---

# An agent reliable  
by construction.

A language model is probabilistic. The program around it does not have to
be. The highest level of agent reliability is to detect what can be codified,
and codify it: the checks live in the code, not in the prompt.

I started the AI assistant of a low-code scripting product, and built it
that way:

- **One interface, any model.** Drivers for cloud models, local models and a
  mock, behind the same interface, in a framework of about nine thousand
  lines.
- **Tool calls checked against the program's types.** Every call the model
  makes is validated against a JSON Schema derived, automatically, from the
  application's own type system. The model cannot ask for something the
  program would not accept, because what it would accept is where the
  schema comes from.
- **Evaluations that cannot be flaky.** The agent's behaviour is specified as
  BDD features and run against the mock driver, so a check that passes today
  passes tomorrow, and says so in the CI.
- **Guardrails.** Limits on iterations and on daily use; an answer that is
  code where words were expected is caught.
- **Cost, counted.** Tokens to the microdollar, across fifteen models from six
  providers — counted after each call and truncated rather than rounded, so
  a user with budget left never sees it at a hundred per cent.

What is now called harness engineering is this, and I have been practising
it for about ten years. I wrote about why commands are coming back in [We're all typing commands
again](https://drpicox.medium.com/were-all-typing-commands-again-ec3cad3b143d).

This site does it too: every program on it is also a tool an agent in the
browser can call, and the schema of each tool is derived from the program's
own parameters — [how this site is built](/projects/architecture/).
