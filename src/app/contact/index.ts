import { ContactRouteConfig } from './contact-route.config';


export const ContactModule = angular
	.module('ContactModule', [])
    .config(ContactRouteConfig)
    .name;
