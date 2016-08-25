import { ClassRouteLoadingDirective } from './class-route-loading.directive';
import { RemoveOnRouteSuccessDirective } from './remove-on-route-success.directive';

export const ToolsModule = angular
	.module('ToolsModule', [])
    .directive('drpxClassRouteLoading', ClassRouteLoadingDirective)
    .directive('drpxRemoveOnRouteSuccess', RemoveOnRouteSuccessDirective)
    .name;
