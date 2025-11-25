// src/embedding/embedding.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { brands, categories, product_variants, products, sizes } from '@prisma/client';

interface GeminiResponse {
  embedding?: { values: number[] };
}

@Injectable()
export class EmbeddingService {
  private supabase: SupabaseClient;
  private geminiApiKey: string;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get('SUPABASE_URL')!,
      this.config.get('SUPABASE_SERVICE_KEY')!,
    );
    this.geminiApiKey = this.config.get('GEMINI_API_KEY')!;
  }

  /**
   * Generate embedding từ text sử dụng Gemini
   */
  async embedText(text: string): Promise<number[]> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'text-embedding-004',
          content: { parts: [{ text }] },
        }),
      },
    );

    const data = (await res.json()) as GeminiResponse;

    if (!data.embedding?.values) {
      console.error('Gemini embedding failed:', data);
      throw new Error('Gemini embedding failed');
    }

    return data.embedding.values;
  }

  /**
   * Upsert document vào Supabase vector store
   */
  async upsertDocument(sourceId: string, content: string, metadata: any, sourceTable: string) {
    const embedding = await this.embedText(content);

    const { error } = await this.supabase.from('documents').upsert(
      {
        source_id: sourceId,
        content,
        metadata,
        embedding,
        source_table: sourceTable,
      },
      { onConflict: 'source_id' },
    );

    if (error) {
      console.error(`❌ Supabase upsert error on ${sourceId}`, error);
      throw error;
    }

    console.log(`✅ Document upserted: ${sourceId}`);
    return { success: true, source_id: sourceId };
  }

  /**
   * Delete document từ vector store
   */
  async deleteDocument(sourceId: string) {
    const { error } = await this.supabase.from('documents').delete().eq('source_id', sourceId);

    if (error) {
      console.error(`❌ Supabase delete error on ${sourceId}`, error);
      throw error;
    }

    console.log(`✅ Document deleted: ${sourceId}`);
    return { success: true };
  }

  /**
   * Search similar documents
   */
  async searchSimilar(query: string, limit = 10, filters?: any) {
    const queryEmbedding = await this.embedText(query);

    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      filter: filters,
    });

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

  /**
   * Build content cho product variant
   */
  buildVariantContent(variant: any, product: any, brand: any, category: any, size: any): string {
    const parts: string[] = [];

    parts.push(`Sản phẩm: ${product.product_name}`);

    if (product.description) {
      parts.push(`Mô tả: ${product.description}`);
    }

    if (brand?.brand_name) {
      parts.push(`Thương hiệu: ${brand.brand_name}`);
    }

    if (category?.category_name) {
      parts.push(`Danh mục: ${category.category_name}`);
    }

    if (size?.size_label) {
      const genderText = size.gender === 'male' ? 'nam' : 'nữ';
      parts.push(
        `Size ${size.size_label} cho ${genderText}. Chiều cao: ${size.height_range}. Cân nặng: ${size.weight_range}.`,
      );
    }

    parts.push(`Giá: ${(+variant.base_price).toLocaleString('vi-VN')}đ`);

    if (variant.attribute && typeof variant.attribute === 'object') {
      const attrs = variant.attribute;
      if (attrs['màu']) parts.push(`Màu: ${attrs['màu']}`);
      if (attrs['chất liệu']) parts.push(`Chất liệu: ${attrs['chất liệu']}`);
      if (attrs['form'] || attrs['phom']) {
        parts.push(`Phom dáng: ${attrs['form'] || attrs['phom']}`);
      }
      if (attrs['công nghệ']) parts.push(`Công nghệ: ${attrs['công nghệ']}`);
      if (attrs['phong cách']) parts.push(`Phong cách: ${attrs['phong cách']}`);
    }

    if (variant.quantity > 0) {
      parts.push(`Còn hàng: ${variant.quantity} sản phẩm`);
    } else {
      parts.push('Hết hàng');
    }

    parts.push(`Mã sản phẩm: ${variant.sku}`);

    return parts.join('. ');
  }

  /**
   * Build content cho size
   */
  buildSizeContent(size: any, brandName: string): string {
    const genderText = size.gender === 'male' ? 'nam' : 'nữ';
    const m = size.measurements;

    const measText =
      size.type === 'pants'
        ? `Eo ${m.waist}, mông ${m.hip}, dài ${m.length}`
        : `Ngực ${m.chest}, eo ${m.waist}, mông ${m.hip}, dài ${m.length}`;

    return `
Bảng size ${brandName} cho ${genderText}.
Loại sản phẩm: ${size.type}, size ${size.size_label}.
Chiều cao phù hợp: ${size.height_range}.
Cân nặng phù hợp: ${size.weight_range}.
Số đo: ${measText}.
`.trim();
  }

  /**
   * Sync product variant to vector store
   */
  async syncVariant(
    variant: product_variants,
    product: products,
    brand: brands | null,
    category: categories | null,
    size: sizes | null,
  ) {
    const content = this.buildVariantContent(variant, product, brand, category, size);

    return this.upsertDocument(
      variant.sku,
      content,
      {
        type: 'product_variant',
        variant_id: variant.variant_id,
        product_id: product.product_id,
        product_slug: product.slug,
        product_name: product.product_name,
        sku: variant.sku,
        barcode: variant.barcode,
        brand_name: brand?.brand_name,
        category_name: category?.category_name,
        size_id: size?.size_id,
        size_name: size?.size_label,
        price: variant.base_price,
        quantity: variant.quantity,
        in_stock: variant.quantity > 0,
        status: variant.status,
        ...(variant.attribute && {
          color: (variant.attribute as any)['màu'],
          material: (variant.attribute as any)['chất liệu'],
          form: (variant.attribute as any)['form'] || (variant.attribute as any)['phom'],
        }),
      },
      'product_variants',
    );
  }

  /**
   * Sync size to vector store
   */
  async syncSize(size: any, brandName: string) {
    const genderText = size.gender === 'male' ? 'nam' : 'nữ';
    const sourceId = `size-${brandName}-${genderText}-${size.type}-${size.size_label}`;
    const content = this.buildSizeContent(size, brandName);

    return this.upsertDocument(
      sourceId,
      content,
      {
        type: 'size',
        size_id: size.size_id,
        brand_name: brandName,
        gender: size.gender,
        size_label: size.size_label,
        product_type: size.type,
        height_range: size.height_range,
        weight_range: size.weight_range,
        measurements: size.measurements,
      },
      'sizes',
    );
  }
}
