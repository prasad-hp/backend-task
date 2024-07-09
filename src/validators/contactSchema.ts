import { z } from "zod";

const contactSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().optional()
});

export default contactSchema;
