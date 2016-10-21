import { ContactModule } from './contact';
import { LinksModule } from './links';
import { HighlightModule } from './highlight';
import { HighlightNomnomlModule } from './highlight-nomnoml';
import { HomeModule } from './home';
import { MarkdownModule } from './markdown';
import { MarkdownTocModule } from './markdown-toc';
import { PostsModule } from './posts';
import { SiteModule } from './site';
import { TagsModule } from './tags';
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
    HomeModule,
    MarkdownModule,
    MarkdownTocModule,
    PostsModule,
    SiteModule,
    TagsModule,
    ToolsModule,
    'drpxSeo',
  ])
  .component('appRoot', AppComponent)
  .name;
