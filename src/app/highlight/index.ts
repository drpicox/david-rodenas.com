import { HighlightService } from './highlight.service';
export { HighlightService };

export const HighlightModule = angular
	.module('HighlightModule', [])
    .service('highlightService', HighlightService)
    .name;
