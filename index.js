'use strict';

const unleash = require('unleash-server');
const azureAdminOauth = require("./azure-auth-hook");


const options = {
    authentication: {
      type: 'custom',
      customAuthHandler: azureAdminOauth,
    },
  };

unleash.start(options).then(instance => {
    console.log(
        `Unleash started on http://localhost:${instance.app.get('port')}`,
    );
});