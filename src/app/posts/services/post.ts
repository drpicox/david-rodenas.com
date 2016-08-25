export class Post {
	title: string;
  abstract: string;
  date: string;
  basename: string;
  snippet: string;
  prev: Post;
  next: Post;
  tags: [string];

  constructor(dto) {
    angular.extend(this, dto);
  }

  hasTag(tag: string): boolean {
    return this.tags.indexOf(tag) !== -1;
  }
}
