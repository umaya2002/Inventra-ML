// import { z } from 'zod';

// const createSchema = z.object({
//   name: z.string(),
//   seller: z.string(),
//   size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
//   category: z.string(),
//   brand: z.string().optional(),
//   price: z.number().min(1, { message: 'Must be grater than 1!' }),
//   stock: z.number().min(1, { message: 'Must be grater than 1!' })
// });
import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1),
  seller: z.string().regex(/^[0-9a-fA-F]{24}$/), // Enforce ObjectId format
  category: z.string().regex(/^[0-9a-fA-F]{24}$/),
  brand: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  description: z.string().optional(),
});


const updateSchema = z.object({
  name: z.string().optional(),
  seller: z.string().optional(),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().min(1, { message: 'Must be grater than 1!' }).optional(),
  stock: z.number().min(1, { message: 'Must be grater than 1!' }).optional()
});

const addStockSchema = z.object({
  stock: z.number().min(1, { message: 'Must be grater than 1!' })
});

const productValidator = { createSchema, updateSchema, addStockSchema };
export default productValidator;
