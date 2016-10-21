import { HighlightService, HighlightServiceProvider } from './highlight.service';
export { HighlightService, HighlightServiceProvider };

export const HighlightModule = angular
	.module('HighlightModule', [])
    .provider('highlightService', HighlightServiceProvider)
    .name;
