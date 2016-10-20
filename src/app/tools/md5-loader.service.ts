export class Md5LoaderService {

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

  get(filename: string, md5: string): angular.IPromise<string> {
    let entry = this.entries[filename];
    if (!entry) {
      let body = this.storageGet(filename, md5);
      if (!body) {
        body = this.remoteGet(filename, md5);
        body.then((body) => this.storageSave(filename, md5, body));        
      }
      entry = {md5: md5, body: body};
      this.entries[filename] = entry;
      body.catch(() => delete this.entries[filename]);
    }
    return entry.body;
  }

  private remoteGet(filename: string, md5: string): angular.IPromise<string> {
      let body = this.$http
        .get(`${filename}?v=${md5}`)
        .then((response) => response.data);
      return body;
  }

  private storageGet(filename: string, md5: string): angular.IPromise<string> {
    let saved = this.localStorage.getItem(`cachedMd5Loader.${filename}`) as string;
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

  private storageSave(filename: string, md5: string, body: string) {
    this.localStorage.setItem(`cachedMd5Loader.${filename}`, `${md5}#${body}`);
  }

}
