import { Tag } from '../';

export const TagWeightComponent = {
  bindings: {
    tag: '<',
    weight: '<'
  },
  template: `
    <a class="tag-weight" 
      ng-style="{fontSize: $ctrl.fontSize}"
      ng-href="#!/tags/{{$ctrl.tag.id}}"
      ng-bind="$ctrl.tag.id"></a>
  `,
  controller: class TagWeightController {
    tags: Tag[];
    weight: number;

    get fontSize() {
      return 100 * (0.5 + Math.sqrt(this.weight)*2) + '%';
    }
  }
};
