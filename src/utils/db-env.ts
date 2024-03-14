// Purpose: Set environment variables for database connection.
// The JDBC URL is parsed and the values are set as environment variables.
// This is a workaround since the database config is delivered as a JDBC URL by the FINT platform.

const databaseUrl = process.env["fint.database.url"];
if (databaseUrl) {
  const url = new URL(databaseUrl.replace("jdbc:", ""));
  process.env.DATABASE_PORT ||= url.port;
  process.env.DATABASE_HOST ||= url.hostname;
  process.env.DATABASE_NAME ||= url.pathname.replace("/", "");
}

const username = process.env["fint.database.username"] || "";
if (username) {
  process.env.DATABASE_USERNAME ||= username;
  process.env.DATABASE_SCHEMA ||= username;
}

const password = process.env["fint.database.password"] || "";
if (password) {
  process.env.DATABASE_PASSWORD ||= password;
}
