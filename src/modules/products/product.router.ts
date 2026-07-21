import { Router } from "express";
import {
  createProduct,
  dectivateProducts,
  deleteProducts,
  getAllProducts,
  getDetailProduct,
  restoreProducts,
  updateProduct,
} from "./product.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";

const productsRouter = Router();

productsRouter.get("/", getAllProducts);
productsRouter.get("/:uuid", getDetailProduct);
productsRouter.post("/", authMiddleware(["admin"]), createProduct);
productsRouter.patch("/:uuid", authMiddleware(["admin"]), updateProduct);
productsRouter.delete("/:uuid", authMiddleware(["admin"]), deleteProducts);
productsRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  dectivateProducts,
);
productsRouter.patch(
  "/restore/:uuid",
  authMiddleware(["admin"]),
  restoreProducts,
);

export default productsRouter;
