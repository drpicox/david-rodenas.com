---
title: "Introduction to Promises"
image: /assets/images/promises-tutorial.jpg
image_width: 500
image_height: 362
tags:
  - talks
  - promises
  - javascript
  - angularjs
  - node
  - teaching
  - bcnjs
description: >
  Callbacks, callbacks and more callbacks,
  and then you lost the track.
  This is a small unpretentious presentation 
  that wants to show what are promises,
  minimal syntax, and why not, allow people
  to just stop using plain callbacks.
website: http://david-rodenas.com/tutorial-promises-v1/
---

I just remember my firsts times in node: there was
callbacks, more callbacks, and then, even more callbacks.

> Do you want a NodeJS joke? No problem, I'll callback you later.

Finally, after asking many people in meetups and have
no answer I discovered promises: they are wonderful!
They does not seem a great deal, because, they are also
a kind of callback, but... 
callbacks he goes in the reverse direction.

Following my live motive 
_If you have learned something interesting, make a speech and share it_
I make an speech and presented it in the BarcelonaJS
meetup that existed in these time.


## Whats the new?

Nowadays I still using promises, and some ReactiveX,
they are kind-alike. 

In these days I almost unknown all the possibilities of
chaineable promises. 
Now I know that you can create even flatter expressions:

```javascript
/* now I can avoid this */
var activityNames = getCurrentUser().
  then(function(user) {
    return user.getActivities().then(function(activities) {
      return Q.all(activities.map(function(activity) {
          return activity.getName();
      }));
    });
  });
```

```javascript
/* and do this instead */
var activityNames = getCurrentUser().
  then(function(user) {
    return user.getActivities();
  }).
  then(function(activities) {
    return Q.all(activities.map(function(activity) {
        return activity.getName();
    }));
  });
```

Also now I have strong 
[arguments in favor of promises](../promises-against-callbacks).
For a long time, promises vs callbacks seemed to be 
a holy war, just like emacs vs vim.
