import { LinksRouteConfig } from './links-route.config';
import { LinksService } from './links.service';


export const LinksModule = angular
	.module('LinksModule', [])
    .config(LinksRouteConfig)
    .service('linksService', LinksService)
    .name;
