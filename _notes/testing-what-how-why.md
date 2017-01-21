---
title: "Testing: What, how and why"
image:
  src: /assets/images/coding-cost.jpg
  width: 638
  height: 479
tags:
  - talks
  - testing
  - legacy-code-rocks
description: >
  I have seen many talks about testing,
  technologies, and explanations about 
  how important is for quality, but
  they do not explain
  what is worth to test, what not, 
  or just fundamentals.
  This talk covers all this points.
website: http://www.slideshare.net/DavidRdenasPic/testing-what-how-why
---
This talk cares about the fundamentals of testing, 
a little bit history of how the professional community developed what we currently know as testing, 
but also about
why I should care about testing? 
why is it important to do a test? 
What is important to test? 
What is not important to test? 
How to do testing? 

There some examples in plnker just to see each step, and many surprises.

<amp-img src="{{ site.baseurl }}/assets/images/calculator-test.jpg" width="638" height="479" layout="responsive"></amp-img>

```javascript
describe('calculator', () => {
  it('should do sums', () => {
    let calculator = new Calculator();
    calculator.input(2);
    calculator.plus();
    calculator.input(4);
    calculator.equal();
    
    let result = calculator.get();
    expect(result).toBe(6);
  });
});
```

This talk also compares what people learned in the 
Computer Sciences and Engineering degrees and what people does in testing. 
It gives some tips to catch up with current state of art and gives some points 
to start changing syllabus to make better engineers. 

This talk is good for beginners, teachers, bosses, 
but also for seasoned techies that just want to light up some of the ideas 
that they might have been hatching. 

Spoiler alert: testing will save you development time and make you a good professional.

I have given this talk in the meetup Legacy Code Rocks.
