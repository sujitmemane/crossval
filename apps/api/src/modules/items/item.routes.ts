import { Router } from "express";
import {
    createItem,
    getItems,
    updateItem,
} from "./item.controller";
import { authenticate, requireOrganization } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
    createItemSchema,
    getItemsSchema,
    updateItemSchema,
} from "./item.validate";

const itemRouter = Router();

itemRouter.post('/', authenticate, requireOrganization, validate(createItemSchema), createItem);
itemRouter.get('/', authenticate, requireOrganization, validate(getItemsSchema, 'query'), getItems);
itemRouter.patch('/:id', authenticate, requireOrganization, validate(updateItemSchema), updateItem);

export default itemRouter;
