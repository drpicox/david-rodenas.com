import { PostsService } from '../../posts';
import { Tag } from '../';

export class TagsService {
  private list: Tag[] = [];
  private dic: {[id: string]: Tag} = {};
  
  /* @ngInject */
  constructor(postsService: PostsService) {
    postsService.getAll().forEach((post) => {
      post.tags.forEach((id) => {
        let tag = this.create(id);
        tag.addPost(post);
      });
    });

    let minPosts = Math.min(...this.list.map(tag => tag.posts.length));
    let maxPosts = Math.max(...this.list.map(tag => tag.posts.length));

    this.list.forEach(tag => tag.updateWeight(minPosts, maxPosts));
    
    sortTags(this.list);
  }
  
  get(id: string): Tag {
    return this.dic[id];
  }

  getSome(ids: string[]) {
    return ids.map(id => this.get(id));
  }

  getAll() {
    return this.list;
  }

  private create(id: string): Tag {
    let tag = this.dic[id];
    if (!tag) {
      tag = new Tag(id);
      this.dic[id] = tag;
      this.list.push(tag);
    }
    return tag;
  }
}

function sortTags(tags: Tag[]) {
  tags.sort((a: Tag, b: Tag) => {
    if (a.id < b.id) {
      return 1;
    } else if (a.id > b.id) {
      return -1;
    } else {
      return 0;
    }
  });
}
