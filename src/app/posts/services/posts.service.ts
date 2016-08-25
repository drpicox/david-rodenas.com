import { Post } from './post';

export class PostsService {
  private list: Post[] = [];
  private bodies: {[id: string]: angular.IPromise<string>} = {};
  private dic: {[id: string]: Post} = {};
  /* @ngInject */
  constructor(private $http: angular.IHttpService) {
    const posts = require('../../../../.tmp/posts.json');
    Object.keys(posts).forEach((basename) => {
      const post = new Post(posts[basename]);
      this.dic[basename] = post;
      this.list.push(post);
    });
    
    sortPosts(this.list);
    computeNextPrev(this.list);
  }

  get(basename: string): Post {
    return this.dic[basename];
  }

  getAll() {
    return this.list;
  }

  getBody(basename: string): angular.IPromise<string> {
    let body = this.bodies[basename];
    if (!body) {
      body = this.$http
        .get(`./posts/${basename}.md`)
        .then((response) => response.data);
      this.bodies[basename] = body;
    }
    return body;
  }
}

function sortPosts(posts: Post[]) {
  posts.sort((a: Post, b: Post) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

function computeNextPrev(posts: Post[]) {
  posts.forEach((p: Post, i: number, posts: Post[]) => {
    p.next = posts[i - 1];
    p.prev = posts[i + 1];
  })
}
