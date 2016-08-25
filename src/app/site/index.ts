import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

export const SiteModule = angular
	.module('SiteModule', [])
    .component('appFooter', FooterComponent)
    .component('appHeader', HeaderComponent)
    .name;