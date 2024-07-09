"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const contactSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phoneNumber: zod_1.z.string().optional()
});
exports.default = contactSchema;
