import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// --- SHARED COLUMNS ---
const baseColumns = {
    id: integer('id').primaryKey({ autoIncrement: true }),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    sync_status: text('sync_status').default('pending'), // pending, synced, failed
};

// --- CORE TABLES ---

export const categories = sqliteTable('categories', {
    ...baseColumns,
    name: text('name').notNull(),
    description: text('description'),
});

export const products = sqliteTable('products', {
    ...baseColumns,
    sku: text('sku').unique().notNull(),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: integer('category_id').references(() => categories.id),
    barcode: text('barcode'),
    unitOfMeasure: text('unit_of_measure').default('pcs'),
    costPrice: real('cost_price').default(0),
    sellingPrice: real('selling_price').default(0),
    minStockLevel: integer('min_stock_level').default(0),
    maxStockLevel: integer('max_stock_level'),
    imageUri: text('image_uri'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
});

export const stockLocations = sqliteTable('stock_locations', {
    ...baseColumns,
    name: text('name').notNull(),
    description: text('description'),
});

export const stockLevels = sqliteTable('stock_levels', {
    ...baseColumns,
    productId: integer('product_id').notNull().references(() => products.id),
    locationId: integer('location_id').notNull().references(() => stockLocations.id),
    quantity: integer('quantity').notNull().default(0),
});

export const batches = sqliteTable('batches', {
    ...baseColumns,
    productId: integer('product_id').notNull().references(() => products.id),
    batchNumber: text('batch_number').notNull(),
    expirationDate: text('expiration_date'),
    quantity: integer('quantity').notNull().default(0),
});

// --- SALES & CUSTOMERS ---

export const customers = sqliteTable('customers', {
    ...baseColumns,
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    creditLimit: real('credit_limit').default(0),
});

export const salesOrders = sqliteTable('sales_orders', {
    ...baseColumns,
    customerId: integer('customer_id').references(() => customers.id),
    totalAmount: real('total_amount').default(0),
    discountAmount: real('discount_amount').default(0),
    status: text('status').default('confirmed'), // draft, confirmed, cancelled
    paymentStatus: text('payment_status').default('paid'), // paid, partial, credit
    dueDate: text('due_date'), // For IOU/Credit
});

export const salesOrderItems = sqliteTable('sales_order_items', {
    ...baseColumns,
    salesOrderId: integer('sales_order_id').notNull().references(() => salesOrders.id),
    productId: integer('product_id').notNull().references(() => products.id),
    quantity: integer('quantity').notNull(),
    price: real('price').notNull(),
    discount: real('discount').default(0),
});

// --- FINANCIALS ---

export const expenses = sqliteTable('expenses', {
    ...baseColumns,
    category: text('category').notNull(), // Rent, Utilities, Marketing, Transport, Packaging, etc.
    amount: real('amount').notNull(),
    description: text('description'),
    date: text('date').notNull(),
    receiptImageUri: text('receipt_image_uri'),
});

// --- SYSTEM ---

export const users = sqliteTable('users', {
    ...baseColumns,
    username: text('username').unique().notNull(),
    fullName: text('full_name'),
    passwordHash: text('password_hash').notNull(),
    role: text('role').default('sales'), // admin, sales, warehouse
});

export const payments = sqliteTable('payments', {
    ...baseColumns,
    salesOrderId: integer('sales_order_id').references(() => salesOrders.id),
    amount: real('amount').notNull(),
    paymentMethod: text('payment_method').default('cash'), // cash, eco_cash, zipit, usd_cash
    date: text('date').default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value'),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable('notifications', {
    ...baseColumns,
    title: text('title').notNull(),
    body: text('body').notNull(),
    type: text('type').default('info'), // info, low_stock, debt, system
    isRead: integer('is_read', { mode: 'boolean' }).default(false),
    data: text('data'), // JSON string for additional metadata
});
