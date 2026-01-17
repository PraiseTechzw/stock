CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`sync_status` text DEFAULT 'pending',
	`sales_order_id` integer,
	`amount` real NOT NULL,
	`payment_method` text DEFAULT 'cash',
	`date` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders`(`id`) ON UPDATE no action ON DELETE no action
);
