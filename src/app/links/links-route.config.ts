import { LinksService } from './links.service';

/* @ngInject */
export function LinksRouteConfig($routeProvider) {
	$routeProvider.when('/links', {
		template: `
<section class="section">
  <main class="container" role="main">
<h1>Links</h1>
<p>
Here you will find some of the resources that I found interesting to share.
Some of them are some of my libraries, 
others are libraries that I use daily,
and others are just interesting or amusing things.
It is just like it was www in 90s.
</p>
  </main>
</section>

<section ng-repeat="section in $resolve.sections track by $index" class="section zone-gray">
    <main class="container">
      <h2>{{ section.title }}</h2>
      
      <a ng-repeat="link in section.links track by $index" class="card" href="{{ link.url }}" target="_blank">
        <div class="card-icon"><i class="fa fa-link"></i></div>
        <h3>{{ link.title }}</h3>
        <span app-bind-markdown="link.text"></span>
      </a>
    </main>
</section>

<section class="section">
  <main class="container" role="main">
    <a href="#!/">← Back to Home</a>
  </main>
</section>
      `,
    resolve: {
      sections: /* @ngInject */ (linksService: LinksService) => linksService.getSections()
    },
    title: 'Links - {{original}}',
    description: 'List of nice to have links of tools and documentation.',
    keywords: 'drpicox,david,rodenas,links,list', 
	});
}

