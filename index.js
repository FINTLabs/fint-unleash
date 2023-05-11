'use strict';

const { ensureSchema } = require("./schema");
const {databaseUrl} = require("./db-url");
const unleash = require('unleash-server');
const azureAdminOauth = require("./azure-auth-hook");

const url = new URL(process.env['fint.database.url'].replace("jdbc:", ""));
const username = process.env['fint.database.username'];
const password = process.env['fint.database.password'];
const dbUri = databaseUrl(username, password, url.hostname, url.port, url.search)

ensureSchema(dbUri);

const options = {
  authentication: {
    type: 'custom',
    customAuthHandler: azureAdminOauth,
  },
  databaseUrl: dbUri,
  db: {
    schema: "unleash",
  }
};

unleash.start(options).then(instance => {
  console.log(
    `Unleash started on http://localhost:${instance.app.get('port')}`,
  );
});