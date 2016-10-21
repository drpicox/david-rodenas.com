import { ContactModule } from './contact';
import { LinksModule } from './links';
import { HighlightModule } from './highlight';
import { HighlightNomnomlModule } from './highlight-nomnoml';
import { MarkdownModule } from './markdown';
import { MarkdownTocModule } from './markdown-toc';
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
    HighlightModule,
    HighlightNomnomlModule,
    MarkdownModule,
    MarkdownTocModule,
    PostsModule,
    SiteModule,
    ToolsModule,
    'drpxSeo',
  ])
  .component('appRoot', AppComponent)
  .name;
