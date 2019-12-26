import express from "express";
import { ParamsDictionary, RequestHandler } from 'express-serve-static-core';
import { RESTMethod } from '../../util/Constants';
import { RESTDecoratorDefinition } from './Decorators';

export * from './Decorators';
export * from "./Route";

export type MethodShit = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => Promise<void>;

export type Handlers = RequestHandler<ParamsDictionary, any, any>[];

export const REST_COMPONENT_SYMBOL = Symbol('RESTComponent');

// tslint:disable-next-line: parameters-max-number
export function applyDecorator(
	method: RESTMethod, 
	path: string, 
	target: any, 
	propertyKey: string | symbol, 
	descriptor: TypedPropertyDescriptor<any>, 
	handlers: Handlers
) {
	if (target.prototype !== undefined) {
		throw new Error(`Decorators can only be applied to non-static class properties ("${String(propertyKey)}" in class "${target.name}")`);
	}

	if (!target.constructor[REST_COMPONENT_SYMBOL]) {
		target.constructor[REST_COMPONENT_SYMBOL] = {
			name: null,
			routes: []
		};
	}

	target.constructor[REST_COMPONENT_SYMBOL].routes.push({
		method,
		path,
		fn: descriptor.value,
		handlers
	} as RESTDecoratorDefinition);
}

