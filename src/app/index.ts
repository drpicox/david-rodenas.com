import { ContactModule } from './contact';
import { LinksModule } from './links';
import { MarkdownModule } from './markdown';
import { PostsModule } from './posts';
import { SiteModule } from './site';
import { ToolsModule } from './tools';

import { AppComponent } from './app.component';

export const DhModule = angular
  .module('dh', [ 
		'ngRoute',
    'drpxOtherwiseHome',
    ContactModule,
    LinksModule,
    MarkdownModule,
    PostsModule,
    SiteModule,
    ToolsModule,
    'drpxSeo',
  ])
  .component('appRoot', AppComponent)
  .name;
