import { LocalStorageFactory } from './local-storage.factory';
import { ClassRouteLoadingDirective } from './class-route-loading.directive';
import { RemoveOnRouteSuccessDirective } from './remove-on-route-success.directive';

export const ToolsModule = angular
	.module('ToolsModule', [])
    .factory('localStorage', LocalStorageFactory)
    .directive('drpxClassRouteLoading', ClassRouteLoadingDirective)
    .directive('drpxRemoveOnRouteSuccess', RemoveOnRouteSuccessDirective)
    .name;
