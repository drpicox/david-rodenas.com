import { TagSimilarity } from '../';

export const TagsRelatedsComponent = {
  bindings: {
    tagSimilarities: '<',
  },
  template: `
    <span ng-repeat="tagSimilarity in $ctrl.tagSimilarities track by tagSimilarity.to.id">
      <app-tag-weight tag="tagSimilarity.to" weight="tagSimilarity.similarity"></app-tag-weight>&#8199;
    </span>
  `,
  controller: class TagRelatedsController {
    tagSimilarities: TagSimilarity[];
  }
};
