---
title: Cleaning Robot AI
image: /assets/images/robot-cleaning-ai.png
image_width: 221
image_height: 169
website: "http://hdl.handle.net/2099.1/13129"
relevance: 2
description: >
  A project to create and evaluate a new AI 
  based in genetic algorithms and
  reinforcement learning.
tags:
  - projects
  - .NET
  - research
  - ai
  - genetic-algorithm
  - reinforcement-learning
  - marina-gispert
  
---

I have been research consultant in 
to create a new AI for a cleaning robot.
This project was implemented and experiments ran by 
Marina Gispert as part of her final project
of a Master's degree in Automatic Control and Robotics.
Implementation and documentation is available in Catalan
[here](http://hdl.handle.net/2099.1/13129).

* Replace this with ToC
{:toc}

## Motivation

This project was initiated due to the poor performance
of a cleaning robot.
The idea was to found a simple AI with low requirements
of sensors that could outperform the original AI.
For this reason, the robot should be equipped with the follow
sensors:
- collision: simple interrupters to detect walls,
- accelerometers: to detect real robot movement,
- distance: to detect the distance to a close obstacle given an angle,
- dirtiness: to detect if dust is aspired
This last sensor is not typical but it is easy to implement (could work the same hardware of any optical mouse) and it is very important to allow automatic learning. Dirty sensor is used to generate *rewards* to the robot for a good job done.

<amp-img layout="responsive" width="254" height="199" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_robot.jpg" alt="robot"
sizes="(min-width: 254px) 254px, 100vw"
></amp-img>

No other complex sensors are used, like position sensor (*GPS*), step counter (real floor can be slippery).

## Testing tools

### Simulator design

Algorithm evaluations are performed in a simple simulator.
I have designed the UML for the student. 
The student has implemented it using .NET.

<amp-img layout="responsive" width="1519" height="1031" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_simulator.png" alt="Simulator UML"></amp-img>

Testing rooms are loaded from maps described in text plain files.
Execution is done in discrete steps. Each step is one robot action.
Algorithm performance is measured by the number of floor tiles
that have been successfully cleaned for a limited number of steps.


## AI Reference Results

### Manufacturer AI

The first test done, 
in order to evaluate the simulator and compare to a real environment
is to implement the original robot algorithm as described 
by the manufacturer.

Many tests and many executions are performed. 
Performance results for 50, 100 and 500 are presented in the following
graphic. Vertical is the performance, horizontal is the number of steps.

<amp-img layout="responsive" width="772" height="339" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_original.png" alt="Performance Original AI"></amp-img>

These tests have demonstrated that the simulated robot behavior 
is close to the real robot.


### Random AI

As a reference test, 
I decide to implement an AI which behavior is random:
at any step it chooses one random action to perform.
The initial intention was to find a worst case scenario
to compare behaviors.

Many tests and many executions are performed. 
Performance results for 50, 100 and 500 are presented in the following
graphic. Vertical is the performance, horizontal is the number of steps.

<amp-img layout="responsive" width="764" height="343" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_random.png" alt="Performance Random AI"></amp-img>

In these tests have shown that the manufacturer AI performance is 
worst than random AI in the average performance.


## Proposed AI results

### Genetic Algorithm AI

I have designed an artificial intelligence based in a control matrix.
Each column describes one sensor input and each row an action.
Each matrix value is a weight assigned for that combination.
AI controller decides which action is performed by 
choosing the action with the maximum sum of activate weights.
It is a kind of a very simple neural network.
Genes are matrix values (weights), and they are muted, and
crossed by single value, single row, single column, or multiple
mutation/crossing operations.

Tests are performed in populations of 1000 individuals 
for 1000 generations. Performance results are
the average of best individuals for 50, 100, and 500 steps.
Vertical is the performance, horizontal is the number of generations.

<amp-img layout="responsive" width="784" height="345" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_genetic.png" alt="Performance Genetic AI"></amp-img>

Genetic algorithm outperforms the manufacturer algorithm, even in
the firsts generations, but it has an important setback:
it requires a previous training for each map. 
So it cannot be used for a commercial robot.


### Reinforcement Learning AI

Reinforcement learning is a AI technique designed to allow
an AI to learn from its success. 
It defines for each combination of inputs and for each action 
a success index. If given a combination of inputs (state)
an action has performed well (it cleaned something), success rate
is increased. 
Chains of actions and inputs are considered by using memory
as inputs.
Action performed in each time step is the one that has the best 
suceess rate.

It has been tested with multiple individuals executed separately.
Each individual is tested 1000 times (days) with the same room and the same
dust and 500 steps. Each individual remembers what was learnt from
previous day. 
Lines are individuals, vertical is performance, horizontal are days.

<amp-img layout="responsive" width="774" height="308" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_rl-classic.png" alt="Performance Reinforcement Learning AI"></amp-img>

Although the theory seemed to be good, 
experiments have shown that this algorithm is not suitable
for the problem. Its best performance is competitive with 
manufacturer and random AIs, but:
- the average performance is the worst of any solution
- performance degenerates day by day of execution

Analysis over the behavior revealed that it fastly decays in
local optimum states and previous results conditionates next learnings.


### Improved Reinforcement Learning AI 

Once previous results are analyzed, 
and with a close deadline, 
I have decided to improve the reinforcement learning adding one concept:
instead of execute the action which was the best in the past,
execute a random action pondered by its result in the past.
The idea of this change is to force to explore all actions
and learn from all actions, even if in the past they were no
so good: if you o always the same, you always have
the same result, even if result is bad. So if there is no
clear idea about a past improvement, keep your mind open.

It has been tested with multiple individuals executed separately.
Each individual is tested 14 times (days) with the same room and the same
dust and 500 steps. Each individual remembers what was learn from
previous day. 
Lines are individuals, vertical is performance, horizontal are days.

<amp-img layout="responsive" width="1228" height="427" src="{{ site.baseurl }}/assets/images/robot-cleaning-ai_rl-improved.png" alt="Performance Improved Reinforcement Learning AI"></amp-img>

Algorithm performance seems a little bit chaotic, but it performs really
good. All individuals outperforms the manufacturer and random algorithm
from the first day, and have a close behavior to the best genetic algorithm
in just few days. 
There is an oscillation in results performance (which should be studied
carefully in the future) but eventually (every 4 or 5 days) it
every individual has good performance. 


## Conclusions

The best of this implementation is that it does not require to have
previous knowledge of the room to be cleaned, and even better, 
thanks to the oscillations in the learning curve, it is able
to adapt to other rooms automatically. 
It really seems to be really suitable for real robots
and as a special hardware it only requires a simple dirtiness sensor.

It has also tested for periods of 1000 days, it keeps the same behavior
and performance all the time.
