/**
 * Model-RPA Engine
 * 核心引擎模块导出
 */

// Stagehand 引擎
export { StagehandEngine, createStagehandEngine } from './stagehand';
export type {
  StagehandConfig,
  ActionResult,
  ExtractResult,
  ObserveResult,
  ObservedElement,
  AgentConfig,
} from './stagehand';

// 缓存管理
export { CacheManager } from './cache/cache-manager';
export { DOMHasher } from './cache/dom-hasher';

// Chromium 管理
export { ChromiumManager } from './chromium';

// Schema 定义
export {
  ElementSchema,
  LinkSchema,
  ImageSchema,
  TableSchema,
  ListItemSchema,
  ArticleSchema,
  ProductSchema,
  SearchResultSchema,
  FormDataSchema,
  PageMetadataSchema,
  ContactInfoSchema,
  SocialMediaSchema,
  PaginationSchema,
  createCustomSchema,
  compileDynamicSchema,
} from './schemas/extraction';

export type {
  Element,
  Link,
  Image,
  Table,
  ListItem,
  Article,
  Product,
  SearchResult,
  FormData,
  PageMetadata,
  ContactInfo,
  SocialMedia,
  Pagination,
} from './schemas/extraction';
