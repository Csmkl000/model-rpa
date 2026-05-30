/**
 * Model-RPA Extraction Schemas
 * 定义数据提取的 Zod Schema
 */

import { z } from 'zod';

/**
 * 基础元素 Schema
 */
export const ElementSchema = z.object({
  selector: z.string(),
  text: z.string(),
  tag: z.string(),
  id: z.string().optional(),
  className: z.string().optional(),
  href: z.string().optional(),
  src: z.string().optional(),
  value: z.string().optional(),
  placeholder: z.string().optional(),
});

export type Element = z.infer<typeof ElementSchema>;

/**
 * 链接 Schema
 */
export const LinkSchema = z.object({
  text: z.string(),
  href: z.string().url(),
  title: z.string().optional(),
  target: z.string().optional(),
});

export type Link = z.infer<typeof LinkSchema>;

/**
 * 图片 Schema
 */
export const ImageSchema = z.object({
  src: z.string().url(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type Image = z.infer<typeof ImageSchema>;

/**
 * 表格数据 Schema
 */
export const TableSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export type Table = z.infer<typeof TableSchema>;

/**
 * 列表项 Schema
 */
export const ListItemSchema = z.object({
  text: z.string(),
  value: z.string().optional(),
  index: z.number(),
});

export type ListItem = z.infer<typeof ListItemSchema>;

/**
 * 文章内容 Schema
 */
export const ArticleSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  publishDate: z.string().optional(),
  content: z.string(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(ImageSchema).optional(),
  links: z.array(LinkSchema).optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

/**
 * 商品信息 Schema
 */
export const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  currency: z.string().default('CNY'),
  description: z.string().optional(),
  images: z.array(ImageSchema).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().optional(),
  inStock: z.boolean().optional(),
  url: z.string().url().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * 搜索结果 Schema
 */
export const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string(),
  position: z.number(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * 表单数据 Schema
 */
export const FormDataSchema = z.record(z.string(), z.string());

export type FormData = z.infer<typeof FormDataSchema>;

/**
 * 页面元数据 Schema
 */
export const PageMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().url(),
  timestamp: z.string(),
});

export type PageMetadata = z.infer<typeof PageMetadataSchema>;

/**
 * 联系信息 Schema
 */
export const ContactInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

/**
 * 社交媒体信息 Schema
 */
export const SocialMediaSchema = z.object({
  platform: z.string(),
  username: z.string(),
  url: z.string().url(),
  followers: z.number().optional(),
  following: z.number().optional(),
});

export type SocialMedia = z.infer<typeof SocialMediaSchema>;

/**
 * 分页信息 Schema
 */
export const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextUrl: z.string().url().optional(),
  previousUrl: z.string().url().optional(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * 创建自定义 Schema 的工具函数
 */
export function createCustomSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

/**
 * 动态 Schema 编译器
 * 根据用户选择的字段动态生成 Schema
 */
export function compileDynamicSchema(fields: Array<{
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  description?: string;
}>) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case 'string':
        schema = z.string();
        break;
      case 'number':
        schema = z.number();
        break;
      case 'boolean':
        schema = z.boolean();
        break;
      case 'array':
        schema = z.array(z.string());
        break;
      default:
        schema = z.string();
    }

    if (!field.required) {
      schema = schema.optional();
    }

    if (field.description) {
      schema = schema.describe(field.description);
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}
