CREATE TABLE `alert_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`alertId` int NOT NULL,
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`value` decimal(15,2) NOT NULL,
	`threshold` decimal(15,2) NOT NULL,
	`message` text NOT NULL,
	`notified` boolean NOT NULL DEFAULT false,
	CONSTRAINT `alert_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`type` enum('receita_baixa','despesa_alta','margem_baixa') NOT NULL,
	`threshold` decimal(15,2) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `alert_history` (`tenantId`);--> statement-breakpoint
CREATE INDEX `alert_idx` ON `alert_history` (`alertId`);--> statement-breakpoint
CREATE INDEX `triggered_at_idx` ON `alert_history` (`triggeredAt`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `financial_alerts` (`tenantId`);