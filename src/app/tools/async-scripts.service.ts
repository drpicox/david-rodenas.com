import { Md5LoaderService } from './';

const asyncScripts = require('../../../.tmp/async-scripts.json') as {
  md5: string,
  files: [string]
};

export class AsyncScriptsService {

  private timer;
  private scripts: angular.IPromise<any>;

  /* @ngInject */
  constructor(
    private md5LoaderService: Md5LoaderService,
    private $q: angular.IQService,  
    private $timeout: angular.ITimeoutService
  ) {
    this.timer = this.$timeout(() => this.fetchAll(), 5000, false);
  }

  public load(filename: string): angular.IPromise<any> {
    if (asyncScripts.files.indexOf(filename) === -1) {
      return this.$q.reject(new Error(`async script "${filename}" not found`));
    }

    return this.fetchAll();
  }

  private fetchAll(): angular.IPromise<any> {
    if (this.scripts) {
      return this.scripts;
    }

    this.$timeout.cancel(this.timer);
    this.scripts = this.md5LoaderService.
      get('assets/async-scripts.js', asyncScripts.md5).
      then((scripts) => window['noStrictEval']('module = exports = require = undefined;'+scripts+'//# sourceURL=assets/async-scripts.js')).
      then(() => window);
    return this.scripts;
  }

}
