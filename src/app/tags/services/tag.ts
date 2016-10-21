import { Post } from '../../posts';

export class Tag {
  weight: number = 0;
  posts: Post[] = [];

  constructor(
    public id: string,
  ) {}

  addPost(post: Post) {
    this.posts.push(post);
  }

  containsPost(post: Post) {
    return this.posts.indexOf(post) >= 0;
  }

  updateWeight(minCount: number, maxCount: number) {
    this.weight = (this.posts.length - minCount) / maxCount;
  }
}
