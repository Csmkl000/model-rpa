/**
 * Model-RPA DOM Hasher
 * 生成 DOM 哈希，用于缓存键和变更检测
 */

/**
 * DOM 哈希生成器
 * 用于生成页面 DOM 的哈希值，实现缓存和变更检测
 */
export class DOMHasher {
  /**
   * 生成动作哈希
   * 基于指令和上下文生成唯一哈希
   */
  hashAction(instruction: string, context?: string): string {
    const content = `${instruction}:${context || ''}`;
    return this.hash(content);
  }

  /**
   * 生成页面哈希
   * 基于页面关键元素生成哈希
   */
  hashPage(html: string): string {
    // 提取关键元素
    const keyElements = this.extractKeyElements(html);
    return this.hash(keyElements);
  }

  /**
   * 生成元素哈希
   * 基于元素属性生成哈希
   */
  hashElement(element: {
    tag: string;
    id?: string;
    className?: string;
    text?: string;
    attributes?: Record<string, string>;
  }): string {
    const parts = [
      element.tag,
      element.id || '',
      element.className || '',
      element.text || '',
      JSON.stringify(element.attributes || {}),
    ];

    return this.hash(parts.join('|'));
  }

  /**
   * 提取页面关键元素
   */
  private extractKeyElements(html: string): string {
    // 提取按钮、链接、输入框等关键元素
    const patterns = [
      /<button[^>]*>.*?<\/button>/gi,
      /<a[^>]*>.*?<\/a>/gi,
      /<input[^>]*>/gi,
      /<select[^>]*>.*?<\/select>/gi,
      /<textarea[^>]*>.*?<\/textarea>/gi,
    ];

    const elements: string[] = [];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches) {
        elements.push(...matches);
      }
    }

    // 提取文本内容
    const textContent = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000);

    return elements.join('\n') + '\n' + textContent;
  }

  /**
   * 生成简单哈希
   * 使用 FNV-1a 算法生成 32 位哈希
   */
  private hash(content: string): string {
    let hash = 0x811c9dc5; // FNV offset basis

    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // FNV prime
    }

    return hash.toString(16).padStart(8, '0');
  }

  /**
   * 生成详细哈希
   * 使用更复杂的算法生成 64 位哈希
   */
  hashDetailed(content: string): string {
    // 使用双重哈希增加唯一性
    const hash1 = this.hash(content);
    const hash2 = this.hash(content.split('').reverse().join(''));

    return hash1 + hash2;
  }

  /**
   * 比较两个哈希是否相同
   */
  compare(hash1: string, hash2: string): boolean {
    return hash1 === hash2;
  }

  /**
   * 检测 DOM 变更
   * 返回 true 如果 DOM 发生了变更
   */
  detectChanges(oldHash: string, newHash: string): boolean {
    return oldHash !== newHash;
  }
}
