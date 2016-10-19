import { MarkdownTocComponent } from './markdown-toc.component';
import { MarkdownTocService } from './markdown-toc.service';
export { MarkdownTocService };
export * from './toc';
export * from './toc-heading';


export const MarkdownTocModule = angular
	.module('MarkdownTocModule', [])
    .component('appMarkdownToc', MarkdownTocComponent)
    .service('markdownTocService', MarkdownTocService)
    .name;
