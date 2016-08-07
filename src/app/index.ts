import { AppComponent } from './app.component';
import { SiteModule } from './site';

export const DhModule = angular
	.module('dh', [ SiteModule ])
	.component('appRoot', AppComponent)
	.name;