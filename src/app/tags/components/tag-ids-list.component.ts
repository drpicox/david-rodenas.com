import { Tag } from '../';

export const TagIdsListComponent = {
  bindings: {
    ids: '<',
  },
  template: `
    Tags: 
    <span ng-repeat="id in $ctrl.ids track by id">
      <a href="#!/tags/{{id}}" class="rel-link" ng-bind="id"></a><span ng-hide="$last" ng-bind="', '"></span>
    </span>
  `,
  controller: class TagIdsListController {
    ids: string[];
  }
};
