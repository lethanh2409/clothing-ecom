-- CreateTable
CREATE TABLE "clothing_ecom"."roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."user_role" (
    "user_role_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_role_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."customers" (
    "customer_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."addresses" (
    "address_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "consignee_name" TEXT NOT NULL,
    "consignee_phone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "street" TEXT NOT NULL DEFAULT '',
    "house_num" TEXT NOT NULL DEFAULT '',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."brands" (
    "brand_id" SERIAL NOT NULL,
    "brand_name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "parent_id" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."lookbooks" (
    "lookbook_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "lookbooks_pkey" PRIMARY KEY ("lookbook_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."products" (
    "product_id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "product_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."lookbook_items" (
    "item_id" SERIAL NOT NULL,
    "lookbook_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "position" INTEGER,
    "note" TEXT,

    CONSTRAINT "lookbook_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."sizes" (
    "size_id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "size_label" TEXT NOT NULL,
    "height_range" TEXT NOT NULL,
    "weight_range" TEXT NOT NULL,
    "measurements" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("size_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."product_variants" (
    "variant_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "size_id" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "attribute" JSONB NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."product_variant_price_history" (
    "id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "old_price" DECIMAL(12,2) NOT NULL,
    "new_price" DECIMAL(12,2) NOT NULL,
    "changed_by" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "changed_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."variant_assets" (
    "asset_id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "url" TEXT,
    "type" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "variant_assets_pkey" PRIMARY KEY ("asset_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."inventory_snapshots" (
    "snapshot_id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_snapshots_pkey" PRIMARY KEY ("snapshot_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."vouchers" (
    "voucher_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(12,2) NOT NULL,
    "min_order_value" DECIMAL(12,2) NOT NULL,
    "max_discount" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "per_customer_limit" INTEGER NOT NULL DEFAULT 1,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("voucher_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."cart" (
    "cart_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "session_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_price" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."cart_detail" (
    "cart_detail_id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "sub_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_detail_pkey" PRIMARY KEY ("cart_detail_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."orders" (
    "order_id" SERIAL NOT NULL,
    "customer_id" INTEGER,
    "address_id" INTEGER,
    "subtotal_price" DECIMAL(12,2) NOT NULL,
    "discount_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(12,2) NOT NULL,
    "shipping_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "note" TEXT,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "order_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "voucher_id" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."order_status_history" (
    "order_update_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("order_update_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."order_detail" (
    "order_detail_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_detail_pkey" PRIMARY KEY ("order_detail_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."payments" (
    "payment_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "method" TEXT,
    "status" TEXT,
    "transaction_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "raw_response" JSONB,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."inventory_transactions" (
    "inventory_id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "change_quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "order_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."returns" (
    "return_id" SERIAL NOT NULL,
    "return_type" TEXT NOT NULL,
    "customer_id" INTEGER,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "image" TEXT,
    "refund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("return_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."return_detail" (
    "return_detail_id" SERIAL NOT NULL,
    "return_id" INTEGER NOT NULL,
    "order_detail_id" INTEGER NOT NULL,
    "new_variant_id" INTEGER,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "return_detail_pkey" PRIMARY KEY ("return_detail_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."reviews" (
    "review_id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "order_detail_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."audit_logs" (
    "audit_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."email_otps" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "email_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clothing_ecom"."site_contents" (
    "content_id" SERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "site_contents_pkey" PRIMARY KEY ("content_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "clothing_ecom"."roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "clothing_ecom"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "clothing_ecom"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_id_key" ON "clothing_ecom"."user_role"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_user_id_key" ON "clothing_ecom"."customers"("user_id");

-- CreateIndex
CREATE INDEX "addresses_customer_id_idx" ON "clothing_ecom"."addresses"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_brand_name_key" ON "clothing_ecom"."brands"("brand_name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "clothing_ecom"."brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "clothing_ecom"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lookbooks_slug_key" ON "clothing_ecom"."lookbooks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "clothing_ecom"."products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lookbook_items_lookbook_id_variant_id_key" ON "clothing_ecom"."lookbook_items"("lookbook_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "sizes_brand_id_gender_size_label_type_key" ON "clothing_ecom"."sizes"("brand_id", "gender", "size_label", "type");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "clothing_ecom"."product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variant_price_history_variant_id_idx" ON "clothing_ecom"."product_variant_price_history"("variant_id");

-- CreateIndex
CREATE INDEX "product_variant_price_history_changed_by_idx" ON "clothing_ecom"."product_variant_price_history"("changed_by");

-- CreateIndex
CREATE UNIQUE INDEX "variant_assets_variant_id_url_key" ON "clothing_ecom"."variant_assets"("variant_id", "url");

-- CreateIndex
CREATE INDEX "inventory_snapshots_variant_id_idx" ON "clothing_ecom"."inventory_snapshots"("variant_id");

-- CreateIndex
CREATE INDEX "inventory_snapshots_snapshot_date_idx" ON "clothing_ecom"."inventory_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_snapshots_variant_id_snapshot_date_key" ON "clothing_ecom"."inventory_snapshots"("variant_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "cart_customer_id_key" ON "clothing_ecom"."cart"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_detail_cart_id_variant_id_key" ON "clothing_ecom"."cart_detail"("cart_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_otps_email_purpose_key" ON "clothing_ecom"."email_otps"("email", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "site_contents_slug_key" ON "clothing_ecom"."site_contents"("slug");

-- CreateIndex
CREATE INDEX "site_contents_slug_idx" ON "clothing_ecom"."site_contents"("slug");

-- CreateIndex
CREATE INDEX "site_contents_category_idx" ON "clothing_ecom"."site_contents"("category");

-- CreateIndex
CREATE INDEX "site_contents_status_idx" ON "clothing_ecom"."site_contents"("status");

-- CreateIndex
CREATE INDEX "site_contents_created_at_idx" ON "clothing_ecom"."site_contents"("created_at");

-- AddForeignKey
ALTER TABLE "clothing_ecom"."user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "clothing_ecom"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "clothing_ecom"."roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "clothing_ecom"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."addresses" ADD CONSTRAINT "addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clothing_ecom"."customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "clothing_ecom"."categories"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "clothing_ecom"."brands"("brand_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "clothing_ecom"."categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."lookbook_items" ADD CONSTRAINT "lookbook_items_lookbook_id_fkey" FOREIGN KEY ("lookbook_id") REFERENCES "clothing_ecom"."lookbooks"("lookbook_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."lookbook_items" ADD CONSTRAINT "lookbook_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."sizes" ADD CONSTRAINT "sizes_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "clothing_ecom"."brands"("brand_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "clothing_ecom"."products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."product_variants" ADD CONSTRAINT "product_variants_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "clothing_ecom"."sizes"("size_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."product_variant_price_history" ADD CONSTRAINT "product_variant_price_history_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."product_variant_price_history" ADD CONSTRAINT "product_variant_price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "clothing_ecom"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."variant_assets" ADD CONSTRAINT "variant_assets_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."cart" ADD CONSTRAINT "cart_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clothing_ecom"."customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."cart_detail" ADD CONSTRAINT "cart_detail_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "clothing_ecom"."cart"("cart_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."cart_detail" ADD CONSTRAINT "cart_detail_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clothing_ecom"."customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "clothing_ecom"."addresses"("address_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."orders" ADD CONSTRAINT "orders_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "clothing_ecom"."vouchers"("voucher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "clothing_ecom"."orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."order_status_history" ADD CONSTRAINT "order_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "clothing_ecom"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."order_detail" ADD CONSTRAINT "order_detail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "clothing_ecom"."orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."order_detail" ADD CONSTRAINT "order_detail_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "clothing_ecom"."orders"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "clothing_ecom"."orders"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."returns" ADD CONSTRAINT "returns_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clothing_ecom"."customers"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."return_detail" ADD CONSTRAINT "return_detail_return_id_fkey" FOREIGN KEY ("return_id") REFERENCES "clothing_ecom"."returns"("return_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."return_detail" ADD CONSTRAINT "return_detail_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "clothing_ecom"."order_detail"("order_detail_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."return_detail" ADD CONSTRAINT "return_detail_new_variant_id_fkey" FOREIGN KEY ("new_variant_id") REFERENCES "clothing_ecom"."product_variants"("variant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "clothing_ecom"."customers"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."reviews" ADD CONSTRAINT "reviews_order_detail_id_fkey" FOREIGN KEY ("order_detail_id") REFERENCES "clothing_ecom"."order_detail"("order_detail_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "clothing_ecom"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_ecom"."site_contents" ADD CONSTRAINT "site_contents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "clothing_ecom"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
