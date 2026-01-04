import "reflect-metadata";

process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3000";
process.env.RATE_LIMIT_MAX ??= "1000";
process.env.RATE_LIMIT_WINDOW_MS ??= "60000";
process.env.CORS_ORIGIN ??= "http://localhost";
process.env.DB_FILE_NAME = "test-db.json";
