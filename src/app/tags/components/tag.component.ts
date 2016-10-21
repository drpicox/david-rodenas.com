import { Tag, TagSimilarity } from '../';

export const TagComponent = {
  bindings: {
    tag: '<',
    tagSimilarities: '<'
  },
  template: `
    <section class="section">
      <main class="container" role="main">
        <h1>Posts about {{$ctrl.tag.id}}</h1>
        Related to:&#8199;<app-tags-relateds tag-similarities="$ctrl.tagSimilarities"></app-tags-relateds>
        <app-posts-list posts="$ctrl.tag.posts"></app-posts-list>
        <br><br>
        <a href="#!/tags" class="rel-link">← See all tags</a>
      </main>
    </section>
  `,
  controller: class TagController {
    tag: Tag;
    tagSimilarities: TagSimilarity[]
  }
};
