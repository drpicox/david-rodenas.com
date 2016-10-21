import { Tag } from '../';
import { TagSimilarity } from '../';
import { TagsService } from '../';

export class RelatedTagsService {
  private tagDistances: {[ab:string]: number} = {};
  private similarities: {[id:string]: TagSimilarity[]} = {};
  
  /* @ngInject */
  constructor(private tagsService: TagsService) {
  }

  get(tag: Tag): TagSimilarity[] {
    let similarities = this.similarities[tag.id];
    if (!similarities) {
      similarities = this.tagsService.
        getAll().
        filter(other => other !== tag).
        map(other => {
          let similarity = this.computeSimilarity(tag, other);
          return new TagSimilarity(tag, other, similarity);
        }).
        filter(tagSimilarity => tagSimilarity.similarity > 0.01);

      this.similarities[tag.id] = similarities;
    }
    return similarities;
  }

  private computeSimilarity(a: Tag, b: Tag): number {
    let total = a.posts.length + b.posts.length;
    let common = a.posts.filter(post => b.containsPost(post)).length;

    return common / (total - common);
  }

}
