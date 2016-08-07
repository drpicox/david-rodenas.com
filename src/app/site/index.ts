import { HeaderComponent } from './header';

export const SiteModule = angular
	.module('SiteModule', [])
    .component('appHeader', HeaderComponent)
    .name;