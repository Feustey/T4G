export * from "./lib/service-mongo";
export * from "./lib/models/Identity";
export * from "./lib/models/Experience";
export * from "./lib/models/Field";
export * from "./lib/models/Notification";
export * from "./lib/models/DBService";
export * from "./lib/models/ServiceCategory";
export * from "./lib/models/Transaction";
export * from "./lib/dao/experiencesDAO";
export * from "./lib/dao/service-fields";
export * from "./lib/dao/notificationsDAO";

// DAOs - use index for dynamic switching between MongoDB and PostgreSQL
export {
  categoriesDAO,
  servicesDAO,
  transactionsDAO,
  identitiesDAO,
  experiencesDAO,
  notificationsDAO,
  MENTORING_CATEGORY_NAME
} from "./lib/dao/index";
