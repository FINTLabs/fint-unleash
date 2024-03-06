import unleash, { IUnleashOptions, IAuthType } from 'unleash-server';

import { databaseUrl } from './db-url';
import azureAdminOauth from './azure-auth-hook';

const url = new URL(
  (process.env['fint.database.url'] ?? '').replace('jdbc:', ''),
);
const username = process.env['fint.database.username'] ?? '';
const password = process.env['fint.database.password'] ?? '';
const dbUri = databaseUrl(
  username,
  password,
  url.hostname,
  url.port,
  url.search,
);

const options: IUnleashOptions = {
  authentication: {
    type: IAuthType.CUSTOM,
    customAuthHandler: azureAdminOauth,
  },
  databaseUrl: dbUri,
  db: {
    schema: username,
    ssl: false,
  },
};

unleash.start(options).then((instance) => {
  console.log(
    `Unleash started on http://localhost:${instance.app.get('port')}`,
  );
});
