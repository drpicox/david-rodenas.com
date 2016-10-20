import { AsyncScriptsService } from './async-scripts.service';
import { LocalStorageFactory } from './local-storage.factory';
import { Md5LoaderService } from './md5-loader.service';
import { ClassRouteLoadingDirective } from './class-route-loading.directive';
import { RemoveOnRouteSuccessDirective } from './remove-on-route-success.directive';
export { AsyncScriptsService, Md5LoaderService };

export const ToolsModule = angular
	.module('ToolsModule', [])
    .service('asyncScriptsService', AsyncScriptsService)
    .factory('localStorage', LocalStorageFactory)
    .service('md5LoaderService', Md5LoaderService)
    .directive('drpxClassRouteLoading', ClassRouteLoadingDirective)
    .directive('drpxRemoveOnRouteSuccess', RemoveOnRouteSuccessDirective)
    .name;
