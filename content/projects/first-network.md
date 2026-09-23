---
title: The first network
summary: A network that tells letters apart, taught by backpropagation — first written in C in 1994 — and the robot of 1995 that learnt, rule by rule, to look for the light.
order: 5
---

# The first network

In 1994, in my second year of BUP, I wrote a neural network in C that told
two letters apart, drawn on a small grid. To learn how, I went to the
university and, with help, searched for papers over Gopher.

This is that program again, in this site's own code: a grid of five cells
by five, ten hidden nodes, one output for each letter, and
backpropagation. Press a cell to ink it or clear it, and the network reads
the drawing again.

::letters

It has been taught A and B, two hundred rounds. Each round shows it every
letter twice, once as drawn and once with one cell wrong, so that it learns
the letter and not the drawing. Tick more letters and it starts again with
all of them. O, C and D are there to be confused. **Forget everything**
leaves it guessing; **teach 100 more rounds** and it comes back.

## The code

This is the whole of the learning, as it runs on this page:

```js
learn(input, target, rate) {
  const values = this.forward(input);
  const output = values[values.length - 1];
  // Each output is to blame for its error,
  // times the slope of the squash where it stands.
  let blame = output.map((value, n) => {
    return (value - target[n]) * value * (1 - value);
  });
  for (let layer = this.weights.length - 1; layer >= 0; layer -= 1) {
    const below = [...values[layer], 1];
    const nodes = this.weights[layer];
    // A node below takes the blame of the nodes it feeds,
    // by its weight on each: before those weights move.
    const passed = values[layer].map((value, i) => {
      let sum = 0;
      for (let n = 0; n < nodes.length; n += 1) {
        sum += nodes[n][i] * blame[n];
      }
      return sum * value * (1 - value);
    });
    for (let n = 0; n < nodes.length; n += 1) {
      for (let i = 0; i < below.length; i += 1) {
        nodes[n][i] -= rate * blame[n] * below[i];
      }
    }
    blame = passed;
  }
  let error = 0;
  for (let n = 0; n < output.length; n += 1) {
    error += (output[n] - target[n]) ** 2;
  }
  return error / 2;
}
```

`forward` works the other way: every node adds up the values below it by
its weights, plus a bias, and squashes the sum between 0 and 1. Then
`learn` starts from the answer. Each output is to blame for how far it
missed. The blame goes down a layer, shared out by the weights. Every
weight moves a little against its share.

## The robot that looked for the light

That same school year I did a robotics workshop at the Museu de la Ciència.
We had to move a small robot, and in theory in plain C, with the moves
written out by hand. I used what I knew about networks to simulate one
instead, with the weights set by hand and no backpropagation, and it worked
at once. They changed the problem: first find a light, then find it
avoiding obstacles. It was enough to give the robot a *feeling*: aversion
to obstacles. Then they asked for a maze, and told us the trick of keeping
a hand on the right-hand wall. The robot got the feeling of *needing to
touch something on its right*, and the change was almost instant. That part
is memory. No code of it is here.

What there is from that spring is a floppy of QBasic, dated April 1995. On
it is a robot that learns to look for the light:

> A learning program. It simulates a robot that will learn to look for
> the `*`. The robot has only an x motor and a y motor. It has two scanners,
> one to know whether the `*` is to the right or to the left, and the other
> whether it is above or below.

That is the header of `ROBOT2.BAS`, saved on 7 April, and this is that
program, sub for sub, on its own screen of eighty columns by twenty-five
rows:

::light-robot

It starts knowing nothing. There are four rules to learn, one for each
motor and each scanner. Until it has them all, it experiments. It picks a
motor and a random step, one way, the other, or none, and keeps it for
five turns. If a step brought it closer, it writes down, for that motor,
what each scanner read and what the motor did:

```basic
IF Bua THEN
    i = Test
    T = Bo
    FOR j = 0 TO 1
        IF T THEN
            IF W(1, i, j) = 2 THEN
                W(0, i, j) = Ae(j)
                W(1, i, j) = Am(i)
                Inc = 0
            END IF
        END IF
    NEXT j
    IF Inc > 0 THEN
        Inc = Inc - 1
    ELSE
        Inc = 5
        Am(Test) = 0
        Test = INT(RND * 2)
        Am(Test) = INT(RND * 3) - 1
    END IF
ELSE
    Test = 0
END IF
```

That is `Aprende`, *learn*, less the line that printed. In English:

```basic
IF StillLearning THEN
    motor = Trying
    closer = GotCloser
    FOR scanner = 0 TO 1
        IF closer THEN
            IF Move(motor, scanner) = UNKNOWN THEN
                Reading(motor, scanner) = Scanner(scanner)
                Move(motor, scanner) = Motor(motor)
                TurnsLeft = 0
            END IF
        END IF
    NEXT scanner
    IF TurnsLeft > 0 THEN
        TurnsLeft = TurnsLeft - 1
    ELSE
        TurnsLeft = 5
        Motor(Trying) = 0
        Trying = INT(RND * 2)
        Motor(Trying) = INT(RND * 3) - 1
    END IF
ELSE
    Trying = 0
END IF
```

Once the four rules are written, it stops experimenting. Each motor adds up
the moves of the rules whose reading it sees now, and takes one step in
that direction.

It learns its four rules in every run, in forty-odd turns on average. Then
it goes where its rules take it, and that is not always the light. A still
light gets reached in fewer than one run in ten, and the code says why.
A good step is written down under *both* scanners, so the row motor
also keeps a rule for what the column scanner read. Level with the light,
the row scanner reads nothing, but a rule like "light to the right: row
motor down" still holds, and it carries the robot past. And each rule knows only the reading it happened to
see while it was learning. Set the light wandering and the robot can find
itself where no rule applies.

The other files on the floppy are the steps around it. `LOBOT.BAS`, on 1
April, is a robot among walls of stars, with scanners that look three cells
each way. `ROBOT.BAS`, saved nine hours after `ROBOT2.BAS`, is the same
program half rewritten. `ROBOT1.BAS`, on 13 April, has four scanners and four motors,
and weights instead of rules: each motor adds up every scanner's reading
times its weight, which is the shape of a neuron.

## Backpropagation, 9 April 1995

In between, on the 9th, `APREN.BAS` has the whole of backpropagation in
outline. There are three layers of weights. The pass forward works out every
node's value. The error starts at the output and goes back layer by layer.
From the error comes a gradient, and every weight is corrected against it:

```basic
FOR capa = 1 TO L
    FOR nodo = 1 TO N(capa)
        t = 0
        FOR i = 0 TO N(capa - 1)
            t = t + (W(capa, nodo, i) * U(capa - 1, i))
        NEXT i
        'IF t > 0 THEN t = 1 ELSE t = -1
        U(capa, nodo) = t
    NEXT nodo
NEXT capa

FOR capa = L TO 1 STEP -1
    FOR nodo = 1 TO N(capa)
        IF capa = L THEN
            e(capa, nodo) = U(capa, nodo) - d(nodo)
        ELSE
            t = 0
            FOR m = 1 TO N(capa - 1)
                t = t + e(capa + 1, m) * U(capa + 1, m) * (1 - U(capa - 1, m)) * W(capa + 1, m, nodo)
            NEXT m
            e(capa, nodo) = t
        END IF
    NEXT nodo
NEXT capa

FOR i = 1 TO UBOUND(g, 1)
    FOR j = LBOUND(g, 2) TO UBOUND(g, 2)
        FOR k = LBOUND(g, 3) TO UBOUND(g, 3)
            g(i, j, k) = e(i, j) * U(i, j) * (1 - U(i, j)) * U(i - 1, j)
        NEXT k
    NEXT j
NEXT i

FOR i = LBOUND(W, 1) TO UBOUND(W, 1)
    FOR j = LBOUND(W, 2) TO UBOUND(W, 2)
        FOR k = LBOUND(W, 3) TO UBOUND(W, 3)
            W(i, j, k) = W(i, j, k) - (m * g(i, j, k))
        NEXT k
    NEXT j
NEXT i
```

That is `Calcular`, *calculate*. In English:

```basic
FOR layer = 1 TO LAYERS
    FOR node = 1 TO Size(layer)
        sum = 0
        FOR i = 0 TO Size(layer - 1)
            sum = sum + (Weight(layer, node, i) * Value(layer - 1, i))
        NEXT i
        'IF sum > 0 THEN sum = 1 ELSE sum = -1
        Value(layer, node) = sum
    NEXT node
NEXT layer

FOR layer = LAYERS TO 1 STEP -1
    FOR node = 1 TO Size(layer)
        IF layer = LAYERS THEN
            Error(layer, node) = Value(layer, node) - Target(node)
        ELSE
            sum = 0
            FOR m = 1 TO Size(layer - 1)
                sum = sum + Error(layer + 1, m) * Value(layer + 1, m) * (1 - Value(layer - 1, m)) * Weight(layer + 1, m, node)
            NEXT m
            Error(layer, node) = sum
        END IF
    NEXT node
NEXT layer

FOR i = 1 TO LAYERS
    FOR j = 0 TO MAX
        FOR k = 0 TO MAX
            Gradient(i, j, k) = Error(i, j) * Value(i, j) * (1 - Value(i, j)) * Value(i - 1, j)
        NEXT k
    NEXT j
NEXT i

FOR i = 0 TO LAYERS
    FOR j = 0 TO MAX
        FOR k = 0 TO MAX
            Weight(i, j, k) = Weight(i, j, k) - (m * Gradient(i, j, k))
        NEXT k
    NEXT j
NEXT i
```

The steps are all there, in the right order, and it shows where the papers
ran out. The squash is missing: the line that would have been the threshold
is a comment. The targets are the same every turn, `−1, 0, 0, 0`, whatever
the scanners read. The gradient reads the value below by the node's index,
`j`, where it wanted `k`. And the rate it learns at is `m`, the counter of
the loop before, left at 5.

The network at the top of this page is the same three steps, with a squash
between 0 and 1, a target for every example, and the right index.
