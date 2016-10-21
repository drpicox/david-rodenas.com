import { AsyncScriptsService } from '../tools';
import { HighlightServiceProvider } from '../highlight';

import { nomnomlHighlighterFactory } from './';

/* @ngInject */
export function NomnomlHighlighterConfig(
  highlightServiceProvider: HighlightServiceProvider
) {
  highlightServiceProvider.addHighlighter('nomnoml', nomnomlHighlighterFactory);
}
