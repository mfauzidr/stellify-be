import { Router } from "express"
import { createProduct, dectivateProducts, deleteProducts, getAllProducts, getDetailProduct, restoreProducts, updateProduct } from "./product.handler";
import { deleteProduct } from "./product.repo";

const productsRouter = Router();

productsRouter.get("/", getAllProducts);
productsRouter.get("/:uuid", getDetailProduct);
productsRouter.post("/", createProduct)
productsRouter.patch("/:uuid", updateProduct)
productsRouter.delete("/:uuid",deleteProducts)
productsRouter.patch("/deactivate/:uuid",dectivateProducts)
productsRouter.patch("/restore/:uuid",restoreProducts)

export default productsRouter;