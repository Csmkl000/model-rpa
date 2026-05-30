/**
 * Extraction Schemas Tests
 * 数据提取 Schema 单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  ArticleSchema,
  ProductSchema,
  SearchResultSchema,
  TableSchema,
  ContactInfoSchema,
  PaginationSchema,
  compileDynamicSchema,
} from '../schemas/extraction';

describe('ArticleSchema', () => {
  it('should validate valid article', () => {
    const article = {
      title: '测试文章',
      content: '这是文章内容',
    };

    const result = ArticleSchema.safeParse(article);
    expect(result.success).toBe(true);
  });

  it('should validate article with optional fields', () => {
    const article = {
      title: '测试文章',
      content: '这是文章内容',
      author: '作者',
      publishDate: '2026-05-30',
      summary: '摘要',
      tags: ['标签1', '标签2'],
    };

    const result = ArticleSchema.safeParse(article);
    expect(result.success).toBe(true);
  });

  it('should reject invalid article', () => {
    const article = {
      // 缺少必填字段 title
      content: '这是文章内容',
    };

    const result = ArticleSchema.safeParse(article);
    expect(result.success).toBe(false);
  });
});

describe('ProductSchema', () => {
  it('should validate valid product', () => {
    const product = {
      name: '测试商品',
      price: 99.99,
    };

    const result = ProductSchema.safeParse(product);
    expect(result.success).toBe(true);
  });

  it('should use default currency', () => {
    const product = {
      name: '测试商品',
      price: 99.99,
    };

    const result = ProductSchema.safeParse(product);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('CNY');
    }
  });

  it('should validate rating range', () => {
    const product = {
      name: '测试商品',
      price: 99.99,
      rating: 6, // 超出范围
    };

    const result = ProductSchema.safeParse(product);
    expect(result.success).toBe(false);
  });

  it('should accept valid rating', () => {
    const product = {
      name: '测试商品',
      price: 99.99,
      rating: 4.5,
    };

    const result = ProductSchema.safeParse(product);
    expect(result.success).toBe(true);
  });
});

describe('SearchResultSchema', () => {
  it('should validate valid search result', () => {
    const result = {
      title: '搜索结果',
      url: 'https://example.com',
      snippet: '这是摘要',
      position: 1,
    };

    const parsed = SearchResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid URL', () => {
    const result = {
      title: '搜索结果',
      url: 'not-a-url',
      snippet: '这是摘要',
      position: 1,
    };

    const parsed = SearchResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

describe('TableSchema', () => {
  it('should validate valid table', () => {
    const table = {
      headers: ['姓名', '年龄', '城市'],
      rows: [
        ['张三', '25', '北京'],
        ['李四', '30', '上海'],
      ],
    };

    const result = TableSchema.safeParse(table);
    expect(result.success).toBe(true);
  });

  it('should accept empty table', () => {
    const table = {
      headers: [],
      rows: [],
    };

    const result = TableSchema.safeParse(table);
    expect(result.success).toBe(true);
  });
});

describe('ContactInfoSchema', () => {
  it('should validate valid contact info', () => {
    const contact = {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
    };

    const result = ContactInfoSchema.safeParse(contact);
    expect(result.success).toBe(true);
  });

  it('should accept partial contact info', () => {
    const contact = {
      email: 'zhangsan@example.com',
    };

    const result = ContactInfoSchema.safeParse(contact);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const contact = {
      email: 'not-an-email',
    };

    const result = ContactInfoSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });
});

describe('PaginationSchema', () => {
  it('should validate valid pagination', () => {
    const pagination = {
      currentPage: 1,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    };

    const result = PaginationSchema.safeParse(pagination);
    expect(result.success).toBe(true);
  });

  it('should accept optional URLs', () => {
    const pagination = {
      currentPage: 2,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: true,
      nextUrl: 'https://example.com?page=3',
      previousUrl: 'https://example.com?page=1',
    };

    const result = PaginationSchema.safeParse(pagination);
    expect(result.success).toBe(true);
  });
});

describe('compileDynamicSchema', () => {
  it('should compile schema with required fields', () => {
    const schema = compileDynamicSchema([
      { name: 'title', type: 'string', required: true },
      { name: 'price', type: 'number', required: true },
    ]);

    const data = { title: '测试', price: 99 };
    const result = schema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('should compile schema with optional fields', () => {
    const schema = compileDynamicSchema([
      { name: 'title', type: 'string', required: true },
      { name: 'tags', type: 'array', required: false },
    ]);

    const data = { title: '测试' };
    const result = schema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const schema = compileDynamicSchema([
      { name: 'title', type: 'string', required: true },
    ]);

    const data = {};
    const result = schema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it('should compile schema with all field types', () => {
    const schema = compileDynamicSchema([
      { name: 'str', type: 'string', required: true },
      { name: 'num', type: 'number', required: true },
      { name: 'bool', type: 'boolean', required: true },
      { name: 'arr', type: 'array', required: true },
    ]);

    const data = {
      str: 'text',
      num: 123,
      bool: true,
      arr: ['a', 'b'],
    };

    const result = schema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
