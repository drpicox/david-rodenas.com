/* @ngInject */
export function ContactRouteConfig($routeProvider) {
	$routeProvider.when('/contact', {
		template: `
<section class="section">
  <div class="container">
    <h1>Are you looking for me?</h1>
    <p>
      <b>Missing something?</b><br>
      This page only have a small portion of everything
      that I have learned through this year.
      From low level as hardware development to
      higher level as front end software development.
    </p>
    <p>
      <b>Did we have met in a meetup?</b><br>
      May be we have shared a nice time talking about
      next developments in technology, or we have shared
      some good thoughts about improve our skills.
    </p>
    <p>
      <b>Do you like some of my contributions for Angular?</b><br>
      I did many interesting contributions, performance, new features,
      and of course some bugfixing.
      If you are enjoying any of them, please let me know.
    </p>
    <p>
      <b>Do you want to learn some ...?</b><br>
      I have been a teacher for some many years, that I am really
      skilled. I can prepare courses or reuse some of them that I already have,
      from introduction to programming and patterns to some advanced
      use of current tools.
    </p>
    <p>
      <b>Do you have an interesting job proposal?</b><br>
      Because the market is open, good job proposals are always welcome,
      and I amb willing to accept new challenges.
    </p>
  </div>
</section>

<iframe height="500" width="100%"
  sandbox="allow-scripts allow-same-origin"
  src="https://drpicox.typeform.com/to/vWt79f"
  frameborder="0">
</iframe>

<section class="section">
  <main class="container" role="main">
    <a href="#!/">← Back to Home</a>
  </main>
</section>
      `,
    title: 'Contact - {{original}}',
    description: 'Want to get in touch with me? Fill out the form below to send me a message and I will try to get back to you within 24 hours',
    keywords: 'drpicox,david,rodenas,contact,form', 
	});
}

/*
Want to get in touch with me? Fill out the form below to send me a message and I will try to get back to you within 24 hours!
*/
