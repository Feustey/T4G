#!/usr/bin/env ts-node
/**
 * Migration Script: MongoDB to PostgreSQL
 * Migrates categories, services, and transactions from MongoDB to PostgreSQL
 */

import { categoriesAPI, servicesAPI, transactionsAPI } from '../apps/dapp/services/postgresApiClient';

// Import MongoDB DAOs
const mongoCategories = require('../libs/service/data/src/lib/dao/categoriesDAO').categoriesDAO;
const mongoServices = require('../libs/service/data/src/lib/dao/servicesDAO').servicesDAO;
const mongoTransactions = require('../libs/service/data/src/lib/dao/transactionsDAO').transactionsDAO;

async function migrateCategories() {
  console.log('🔄 Migrating categories from MongoDB to PostgreSQL...');

  try {
    const mongoCategories = await mongoCategories.getAll();
    console.log(`  Found ${mongoCategories.length} categories in MongoDB`);

    for (const category of mongoCategories) {
      try {
        await categoriesAPI.create({
          name: category.name,
          kind: category.kind,
          description: category.description,
          href: category.href,
          default_price: category.defaultPrice,
          default_unit: category.defaultUnit,
          icon: category.icon,
          disabled: category.disabled,
          service_provider_type: category.serviceProviderType,
          audience: category.audience,
        });
        console.log(`  ✅ Migrated category: ${category.name}`);
      } catch (error: any) {
        console.error(`  ❌ Failed to migrate category ${category.name}:`, error.message);
      }
    }

    console.log('✅ Categories migration completed\n');
  } catch (error: any) {
    console.error('❌ Categories migration failed:', error.message);
  }
}

async function migrateServices() {
  console.log('🔄 Migrating services from MongoDB to PostgreSQL...');

  try {
    const mongoServices = await mongoServices.getAll();
    console.log(`  Found ${mongoServices.length} services in MongoDB`);

    for (const service of mongoServices) {
      try {
        await servicesAPI.create({
          name: service.name,
          unit: service.unit,
          description: service.description,
          summary: service.summary,
          avatar: service.avatar,
          price: service.price,
          audience: service.audience || 'SERVICE_PROVIDER',
          category_id: service.category?.toString(),
          service_provider_id: service.serviceProvider?.toString(),
          annotations: service.annotations || [],
        });
        console.log(`  ✅ Migrated service: ${service.name}`);
      } catch (error: any) {
        console.error(`  ❌ Failed to migrate service ${service.name}:`, error.message);
      }
    }

    console.log('✅ Services migration completed\n');
  } catch (error: any) {
    console.error('❌ Services migration failed:', error.message);
  }
}

async function migrateTransactions() {
  console.log('🔄 Migrating transactions from MongoDB to PostgreSQL...');

  try {
    const mongoTransactions = await mongoTransactions.getAll();
    console.log(`  Found ${mongoTransactions.length} transactions in MongoDB`);

    for (const tx of mongoTransactions) {
      try {
        await transactionsAPI.create({
          hash: tx.hash,
          block: tx.block,
          ts: new Date(tx.ts),
          from_address: tx.from,
          to_address: tx.to,
          method: tx.method,
          event: tx.event,
          target_id: tx.targetId,
          transfer_from: tx.transferFrom,
          transfer_to: tx.transferTo,
          transfer_amount: tx.transferAmount,
          deal_id: tx.dealId,
          service_id: tx.serviceId,
          service_buyer: tx.serviceBuyer,
          service_provider: tx.serviceProvider,
        });
        console.log(`  ✅ Migrated transaction: ${tx.hash}`);
      } catch (error: any) {
        console.error(`  ❌ Failed to migrate transaction ${tx.hash}:`, error.message);
      }
    }

    console.log('✅ Transactions migration completed\n');
  } catch (error: any) {
    console.error('❌ Transactions migration failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting MongoDB to PostgreSQL migration\n');
  console.log('⚠️  Make sure the Rust backend is running on http://localhost:3000\n');

  await migrateCategories();
  await migrateServices();
  await migrateTransactions();

  console.log('🎉 Migration completed!');
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
}
