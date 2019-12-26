
import * as express from 'express';
import { applyDecorator, REST_COMPONENT_SYMBOL, MethodShit, Handlers } from "./";
import { RESTMethod } from '../../util/Constants';
import { RequestHandler, ParamsDictionary } from 'express-serve-static-core';


export interface RESTDecoratorDefinition {
	method: RESTMethod;
	path: string;
	fn: MethodShit;
	handlers: Handlers;
}

export interface ROUTE_OBJECT {
	name: string;
	routes: RESTDecoratorDefinition[];
}

export function getRouteObject(target: any): ROUTE_OBJECT | undefined {
	if (target.constructor == null || !target.constructor[REST_COMPONENT_SYMBOL].name) return;
	if (!target.constructor[REST_COMPONENT_SYMBOL]) return;

	return target.constructor[REST_COMPONENT_SYMBOL];
}

export function Get(path: string = "/", ...handlers: Handlers): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		applyDecorator(RESTMethod.GET, path, target, propertyKey, descriptor, handlers);
	};
}

export function Post(path: string = "/", ...handlers: Handlers): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		applyDecorator(RESTMethod.GET, path, target, propertyKey, descriptor, handlers);
	};
}

export function Put(path: string = "/", ...handlers: Handlers): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		applyDecorator(RESTMethod.GET, path, target, propertyKey, descriptor, handlers);
	};
}

export function Patch(path: string = "/", ...handlers: Handlers): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		applyDecorator(RESTMethod.GET, path, target, propertyKey, descriptor, handlers);
	};
}

export function Delete(path: string = "/", ...handlers: Handlers): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		applyDecorator(RESTMethod.GET, path, target, propertyKey, descriptor, handlers);
	};
}

export function Router(name: string = "/"): ClassDecorator {
	return function (target: any) {
		target[REST_COMPONENT_SYMBOL].name = name;
	}
}

export function Use(path?: string): MethodDecorator {
	return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
		applyDecorator(RESTMethod.USE, path || "", target, propertyKey, descriptor, []);
	}
}
