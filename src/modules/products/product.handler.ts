import { Request, Response } from "express";
import paginLink from "src/shared/helper/paginLinks";
import { AppError } from "src/shared/helper/appError";
import {
  IProductParams,
  IProductQueryParams,
  IProducts,
  IProductsBody,
} from "./product.model";
import { IProductResponse } from "src/shared/models/response.model";
import {
  deleteProduct,
  findAll,
  findDetails,
  insert,
  setActiveProducts,
  totalCount,
  update,
} from "./product.repo";
import { cloudinaryUploader } from "src/shared/helper/courdinary";

export const getAllProducts = async (
  req: Request<{}, {}, {}, IProductQueryParams>,
  res: Response<IProductResponse>,
) => {
  const query = req.query;
  const products = await findAll(query);

  if (products.length < 1) {
    throw new AppError("NO_DATA", "Products not found", 404);
  }

  const limit = req.query.limit || "12";
  const count = await totalCount(query);
  const currentPage = parseInt((req.query.page as string) || "1");
  const totalData = count;
  const totalPage = Math.ceil(totalData / parseInt(limit as string));

  return res.status(200).json({
    meta: {
      totalData,
      totalPage,
      currentPage,
      nextPage: currentPage != totalPage ? paginLink(req, "next") : null,
      prevPage: currentPage > 1 ? paginLink(req, "previous") : null,
    },
    message: `List all products. ${count} data found`,
    results: products,
  });
};

export const getDetailProduct = async (
  req: Request<IProducts>,
  res: Response<IProductResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  const product = await findDetails(uuid);
  if (product.length === 0) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }
  return res.json({
    success: true,
    message: "OK",
    results: product,
  });
};

export const createProduct = async (
  req: Request<{}, {}, IProductsBody>,
  res: Response<IProductResponse>,
): Promise<Response> => {
  const price = Number(req.body.price);

  const productData = {
    name: req.body.name,
    member_uuid: req.body.member_uuid,
    price,
    stock: req.body.stock,
  };
  const product = await insert(productData);
  const productUuid = product[0].uuid;

  if (req.file) {
    const uploadResult = await cloudinaryUploader(
      req.file,
      "products",
      productUuid,
    );

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result?.secure_url;
    await update(productUuid, { image: imageUrl });
  }

  return res.json({
    success: true,
    message: "Create product successfully",
    results: product,
  });
};

export const updateProduct = async (
  req: Request<{ uuid: string }, {}, IProductsBody>,
  res: Response<IProductResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  const data: Partial<IProductsBody> = { ...req.body };

  if (req.file) {
    const uploadResult = await cloudinaryUploader(req.file, "products", uuid);

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result?.secure_url;
    data.image = imageUrl;
  }

  const products = await update(uuid, data);
  if (products.length < 1) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }
  return res.json({
    success: true,
    message: "Update products successfully",
    results: products,
  });
};

export const deleteProducts = async (
  req: Request<IProductParams>,
  res: Response<IProductResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  const product = await deleteProduct(uuid);

  if (product.length === 0) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  return res.json({
    success: true,
    message: "Delete success",
    results: product,
  });
};

export const dectivateProducts = async (
  req: Request<{ uuid: string }>,
  res: Response<IProductResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const result = await setActiveProducts(uuid, false);
  if (result.length < 1) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product deactived",
    results: result,
  });
};

export const restoreProducts = async (
  req: Request<{ uuid: string }>,
  res: Response<IProductResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const result = await setActiveProducts(uuid, true);
  if (result.length < 1) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product restored",
    results: result,
  });
};
