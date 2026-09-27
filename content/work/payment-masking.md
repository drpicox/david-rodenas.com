---
title: A mask that cannot drift from its audit
summary: Payment cards inside free-text terminal commands, a log that must never show them and an audit that must record them — and one pattern that does both, so the two cannot drift apart.
order: 1
---

# A mask that cannot  
drift from its audit.

A terminal where travel agents type commands in a dense, decades-old syntax.
Some of those commands carry a payment card — its number, its expiry, its
security code — as bare strings inside free text. The service logs every
command it passes on. And security wanted a structured audit trail of every
payment. Two requirements pulling opposite ways: keep the card out of the
log, and record what happened to it.

The usual answer is two pieces of code, one that masks and one that extracts
for the audit, and a review to keep them in step. Two lists drift. That is
what two lists do.

## One pattern, both jobs

So I put the rules in the one place both jobs have to read: the names of a
regular expression's capture groups, as a small language of prefixes.

- `mask_` — hide the whole value in the log.
- `maskBut4_` — hide all but its last four digits.
- `field_` — copy the value into the audit event.
- `show_` — leave it as it is.

Prefixes combine, so a single group recognises a card number, truncates it in
the log and records it for the audit, from the same place. As an
illustration — not the production pattern:

```
(?<maskBut4_field_cardNumber>\d{13,19})
```

What cannot happen then is a value masked and not audited, or audited and
not masked: there is only one place that says either.

## The proof

Thirty-three mappers and some 180 test cases. One of them checks the
invariant the whole design rests on: the request that goes out is
byte-for-byte what the agent typed, while its log line is masked — the
sanitising belongs to the log alone. And the expressions themselves were
treated as security primitives and hardened: anchored, lazy quantifiers,
bounded repetition.

Engineering controls on a live data path, under external audit.
