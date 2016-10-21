import { NomnomlHighlighterConfig } from './nomnoml-highlighter.config';
export * from './nomnoml-highlighter.factory';

export const HighlightNomnomlModule = angular
	.module('HighlightNomnomlModule', [])
    .config(NomnomlHighlighterConfig)
    .name;
