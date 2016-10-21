import { RelatedTagsService } from './services/related-tags.service';
import { TagsService } from './services/tags.service';

export { Tag } from './services/tag';
export { TagSimilarity } from './services/tag-similarity';
export { RelatedTagsService, TagsService };

import { TagCloudComponent } from './components/tag-cloud.component';
import { TagIdsListComponent } from './components/tag-ids-list.component';
import { TagWeightComponent } from './components/tag-weight.component';
import { TagComponent } from './components/tag.component';
import { TagsRelatedsComponent } from './components/tags-relateds.component';
import { TagsRouteConfig } from './routes/tags-route.config';
import { TagsXRouteConfig } from './routes/tags-x-route.config';

export const TagsModule = angular
	.module('TagsModule', [])
	.config(TagsRouteConfig)
	.config(TagsXRouteConfig)
  .service('tagsService', TagsService)
  .service('relatedTagsService', RelatedTagsService)
	.component('appTag', TagComponent)
	.component('appTagCloud', TagCloudComponent)
	.component('appTagIdsList', TagIdsListComponent)
	.component('appTagWeight', TagWeightComponent)
	.component('appTagsRelateds', TagsRelatedsComponent)
	.name;
