import { Post } from './post';
import { PostsService } from './posts.service';

export class RelatedPostsService {
  private postDistances: {[ab:string]: number} = {};
  private tagCounts: {[tag:string]: number};
  private tagWeights: {[tag:string]: number};
  private relateds: {[basename:string]: Post[]} = {};
  /* @ngInject */
  constructor(private postsService: PostsService) {
  }

  get(post: Post): Post[] {
    if (!this.relateds[post.basename]) {
      const posts = this.postsService.getAll();
      const idx = posts.indexOf(post);
      const prev = this.getClosers(posts.slice(idx + 1), post).slice(0, 4);      
      const next = this.getClosers(posts.slice(0, Math.max(0, idx)), post).slice(0, 3);
      this.relateds[post.basename] = prev.concat(next);
    }
    return this.relateds[post.basename];
  }

  private computeDistance(a: Post, b: Post): number {
    const tagWeights = this.getTagWeights();
    return a.tags.reduce((distance: number, tag: string) => {
      if (b.hasTag(tag)) {
        distance += tagWeights[tag];
      }
      return distance;
    }, 0)
  }

  private getClosers(posts: Post[], post: Post): Post[] {
    var distances = posts.map((other:Post, index:number) => {
      return { 
        distance: this.getDistance(post, other),
        other,
        index,
      };
    });
    distances.sort((a, b) => b.distance - a.distance || a.index - b.index);
    return distances.map((d) => d.other);
  }

  private getDistance(a: Post, b: Post): number {
    if (a.basename > b.basename) {
      return this.getDistance(b, a);
    }
    const ab = a.basename +'#'+ b.basename;
    if (!this.postDistances[ab]) {
      this.postDistances[ab] = this.computeDistance(a, b) + this.computeDistance(b, a);
    }
    return this.postDistances[ab];
  }

  private getTagCounts(): {[tag:string]: number} {
    if (!this.tagCounts) {
      const tags: [string] = [].concat.apply([], this.postsService.getAll().map((post: Post) => post.tags));
      this.tagCounts = tags.reduce((counts: {[tag:string]: number}, tag: string) => {
        counts[tag] = counts[tag] || 0 + 1;
        return counts;
      }, {} as {[tag:string]: number});
    }
    return this.tagCounts;
  }

  private getTagWeights(): {[tag:string]: number} {
    if (!this.tagWeights) {
      const tagCounts = this.getTagCounts();
      const max = Object.keys(tagCounts).reduce((max: number, tag: string) => {
        return Math.max(max, tagCounts[tag]);
      }, 0);
      this.tagWeights = Object.keys(tagCounts).reduce((tagWeights: {[tag:string]: number}, tag: string) => {
        tagWeights[tag] = max / tagCounts[tag];
        return tagWeights;
      }, {} as {[tag:string]: number});
    }
    return this.tagWeights;
  }
}
