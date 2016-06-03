---
title: "Progressive Web Apps"
subtitle: "Webs that behaves like Apps"
tags:
  - teaching
  - angular
date: 2016-06-03
abstract: >
    What if I can say you that you can build a WebSite
    that can be installed in a mobile phone like a native
    App, that has instant loading, works offline and can
    receive notifications?
snippet: |
    ```javascript
    if('serviceWorker' in navigator) {
      navigator.serviceWorker
               .register('/sw.js')
               .then(function() { console.log("Service Worker Registered"); });
    }
    ```
---

Progressive Web App is a Web App that can work as an App inside a Mobile phone but at the same time as a Web App in any other browser. For this reason the web app must be able to have instant loading, be able to be added to home screen, may receive push notifications, be fast and secure, and be responsive.

### Offline, instant loading, and home screen

In 2007 Apple released the first iPhone and the first iPod Touch without and SDK to create native apps. The original idea were to create apps through HTML5 that might been installed as apps in the home screen. Because of it, the HTML5 was extended with many features like offline databases and cache manifest.

While offline databases (like WebSQL and IndexedDb) were very useful for Javascript programming, they helped little to the HTML/CSS part: all resources loaded from HTML/CSS were handled by the browser and not by the app. Because of it they created the cache manifest: a text file able to identify in which resources were cached and wich ones recovered by network, but with no interaction of Javascript. It was very limited approach.

[Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) were created as a solution to the limitations of the cache manifest: a service worker is a independent Javascript process that acts as a Proxy, has its own life cycle, and it is able to programmatically decide what to do with the resources related to its web page (including HTML and CSS).

Thanks to these technologies, almost all mobile devices are able to install a Web Page in the Home Screen, work in offline (because all required resources are cached), and using Service Workers, androids would ask to install the app locally.

### Push Notifications

[Push notifications](https://developer.mozilla.org/en/docs/Web/API/Push_API) are relatively new in web pages. Almost all top social networks already use them: twitter, facebook, google, ... 

Although you can think that you can only receive push notifications while your App is running, it is not 100% true. It turns out that, if you are using service workers, because service workers have its own life cycle, your app can handle incoming notifications and display them even when your app is closed.

### Responsive

So, at the end, Progressive Web Apps are about webs that can behave like apps, but, they are webs. So, if you make you web app responsive, you can make it work in any device, even if the latest innovations are not available.

### Fast

And of course, do not forget, that if your web app will be installed as an App, users will expect the same performance of your web app that the one present in native apps.