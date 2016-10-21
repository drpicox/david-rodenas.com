import { HomeComponent } from './home.component';
import { HomeRouteConfig } from './home-route.config';

export const HomeModule = angular
	.module('HomeModule', [])
  .config(HomeRouteConfig)
  .component('appHome', HomeComponent)
	.name;
