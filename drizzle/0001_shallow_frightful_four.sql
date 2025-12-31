CREATE TABLE `cash_flow` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`date` timestamp NOT NULL,
	`openingBalance` decimal(15,2) NOT NULL DEFAULT '0',
	`inflow` decimal(15,2) NOT NULL DEFAULT '0',
	`outflow` decimal(15,2) NOT NULL DEFAULT '0',
	`closingBalance` decimal(15,2) NOT NULL DEFAULT '0',
	`variation` decimal(5,2) NOT NULL DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cash_flow_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_date_idx` UNIQUE(`tenantId`,`date`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('FIXO','VARIÁVEL') NOT NULL,
	`group` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`taxRegime` varchar(100),
	`currentBalance` decimal(15,2) NOT NULL DEFAULT '0',
	`bankAccount` varchar(255),
	`responsible` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_code_idx` UNIQUE(`tenantId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`document` varchar(20),
	`contact` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `import_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text,
	`importType` varchar(100) NOT NULL,
	`status` enum('Processando','Sucesso','Erro','Parcial') NOT NULL DEFAULT 'Processando',
	`totalRows` int NOT NULL DEFAULT 0,
	`successRows` int NOT NULL DEFAULT 0,
	`errorRows` int NOT NULL DEFAULT 0,
	`errorDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `import_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`marketplaceId` int NOT NULL,
	`date` timestamp NOT NULL,
	`pendingBalance` decimal(15,2) NOT NULL DEFAULT '0',
	`availableBalance` decimal(15,2) NOT NULL DEFAULT '0',
	`expectedReleaseDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplace_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`averageFee` decimal(5,2) NOT NULL DEFAULT '0',
	`releaseDelay` int NOT NULL DEFAULT 0,
	`linkedAccountCode` varchar(50),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_code_idx` UNIQUE(`tenantId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `payables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`referenceId` varchar(100),
	`beneficiary` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL,
	`costCenter` varchar(255),
	`amount` decimal(15,2) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paymentDate` timestamp,
	`status` enum('Aberto','Pago','Vencido') NOT NULL DEFAULT 'Aberto',
	`paymentMethod` varchar(100),
	`costType` enum('FIXO','VARIÁVEL') NOT NULL,
	`channel` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`sku` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(255),
	`costPrice` decimal(15,2) NOT NULL DEFAULT '0',
	`salePrice` decimal(15,2) NOT NULL DEFAULT '0',
	`currentStock` int NOT NULL DEFAULT 0,
	`minStock` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_sku_idx` UNIQUE(`tenantId`,`sku`)
);
--> statement-breakpoint
CREATE TABLE `receivables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`referenceId` varchar(100),
	`customerName` varchar(255) NOT NULL,
	`channel` varchar(100) NOT NULL,
	`accountCode` varchar(50),
	`amount` decimal(15,2) NOT NULL,
	`expectedDate` timestamp NOT NULL,
	`receivedDate` timestamp,
	`status` enum('Previsto','Recebido','Atrasado') NOT NULL DEFAULT 'Previsto',
	`daysOverdue` int NOT NULL DEFAULT 0,
	`type` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `receivables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`productId` int NOT NULL,
	`date` timestamp NOT NULL,
	`type` enum('Entrada','Saída') NOT NULL,
	`quantity` int NOT NULL,
	`unitCost` decimal(15,2) NOT NULL DEFAULT '0',
	`totalCost` decimal(15,2) NOT NULL DEFAULT '0',
	`reference` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`contact` varchar(255),
	`email` varchar(320),
	`phone` varchar(20),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_parameters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`minCashBalance` decimal(15,2) NOT NULL DEFAULT '50000',
	`minRunwayDays` int NOT NULL DEFAULT 30,
	`maxMarketplaceLockedPercent` decimal(5,2) NOT NULL DEFAULT '30',
	`maxOverdueReceivablesPercent` decimal(5,2) NOT NULL DEFAULT '10',
	`maxOverduePayablesAmount` decimal(15,2) NOT NULL DEFAULT '10000',
	`minGrossMarginPercent` decimal(5,2) NOT NULL DEFAULT '25',
	`negativeProjectionAlertDays` int NOT NULL DEFAULT 7,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_parameters_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_idx` UNIQUE(`tenantId`)
);
--> statement-breakpoint
CREATE TABLE `tenant_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','user') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tenant_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_user_idx` UNIQUE(`tenantId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`ownerId` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `cash_flow` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `categories` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `companies` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `customers` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `import_logs` (`tenantId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `import_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `marketplace_balances` (`tenantId`);--> statement-breakpoint
CREATE INDEX `marketplace_idx` ON `marketplace_balances` (`marketplaceId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `marketplaces` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `payables` (`tenantId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `payables` (`status`);--> statement-breakpoint
CREATE INDEX `due_date_idx` ON `payables` (`dueDate`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `products` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `receivables` (`tenantId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `receivables` (`status`);--> statement-breakpoint
CREATE INDEX `expected_date_idx` ON `receivables` (`expectedDate`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `stock_movements` (`tenantId`);--> statement-breakpoint
CREATE INDEX `product_idx` ON `stock_movements` (`productId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `stock_movements` (`date`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `suppliers` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `tenant_users` (`tenantId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `tenant_users` (`userId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `tenants` (`ownerId`);