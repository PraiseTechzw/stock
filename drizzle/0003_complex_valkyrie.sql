CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`sync_status` text DEFAULT 'pending',
	`title` text NOT NULL,
	`body` text NOT NULL,
	`type` text DEFAULT 'info',
	`is_read` integer DEFAULT false,
	`data` text
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sales_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`sync_status` text DEFAULT 'pending',
	`customer_id` integer,
	`total_amount` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`status` text DEFAULT 'confirmed',
	`payment_status` text DEFAULT 'paid',
	`due_date` text,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sales_orders`("id", "created_at", "updated_at", "sync_status", "customer_id", "total_amount", "discount_amount", "status") SELECT "id", "created_at", "updated_at", "sync_status", "customer_id", "total_amount", "discount_amount", "status" FROM `sales_orders`;--> statement-breakpoint
DROP TABLE `sales_orders`;--> statement-breakpoint
ALTER TABLE `__new_sales_orders` RENAME TO `sales_orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `customers` ADD `credit_limit` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `products` ADD `is_favorite` integer DEFAULT false;