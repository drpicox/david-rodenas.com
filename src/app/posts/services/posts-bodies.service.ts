export class PostsBodiesService {
  private entries: {[id: string]: {
    md5: string;
    body: angular.IPromise<string>;
  }} = {};

  /* @ngInject */
  constructor(
    private localStorage, 
    private $http: angular.IHttpService, 
    private $q: angular.IQService
  ) {}

  getBody(basename: string, md5: string): angular.IPromise<string> {
    let entry = this.entries[basename];
    if (!entry) {
      let body = this.storageGet(basename, md5);
      if (!body) {
        body = this.remoteGet(basename);
        body.then((body) => this.storageSave(basename, md5, body));        
      }
      entry = {md5: md5, body: body};
      this.entries[basename] = entry;
      body.catch(() => delete this.entries[basename]);
    }
    return entry.body;
  }

  private remoteGet(basename: string): angular.IPromise<string> {
      let body = this.$http
        .get(`./posts/${basename}.md`)
        .then((response) => response.data);
      return body;
  }

  private storageGet(basename: string, md5: string): angular.IPromise<string> {
    let saved = this.localStorage.getItem(`appPostsBodies.body.${basename}`) as string;
    if (!saved) {
      return null;
    }
    const idx = saved.indexOf('#');
    const savedMd5 = saved.slice(0, idx);
    if (savedMd5 !== md5) {
      return null;
    }

    const body = saved.slice(idx + 1);
    return this.$q.when(body);
  }

  private storageSave(basename: string, md5: string, body: string) {
    this.localStorage.setItem(`appPostsBodies.body.${basename}`, `${md5}#${body}`);
  }
}
