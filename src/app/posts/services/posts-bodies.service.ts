import { Md5LoaderService } from '../../tools';

export class PostsBodiesService {

  /* @ngInject */
  constructor(
    private md5LoaderService: Md5LoaderService
  ) {}

  getBody(basename: string, md5: string): angular.IPromise<string> {    
    return this.md5LoaderService.get(`./posts/${basename}.md`, md5);
  }

}
