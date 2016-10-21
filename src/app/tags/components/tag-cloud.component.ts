import { Tag } from '../';

export const TagCloudComponent = {
  bindings: {
    tags: '<',
  },
  template: `
    <span ng-repeat="tag in $ctrl.tags track by tag.id">
      <app-tag-weight tag="tag" weight="tag.weight"></app-tag-weight>&#8199;
    </span>
  `,
  controller: class TagCloudController {
    tags: Tag[];
  }
};
