import { ParamsDictionary } from "express-serve-static-core";
import { IProductParams, IProductQueryParams } from "src/modules/products/product.model";

export type AppParams =
    | ParamsDictionary
    | IProductParams;

export type QueryParams = IProductQueryParams;