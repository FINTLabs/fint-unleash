import "utils/db-env";

import unleash, { IUnleashOptions, IAuthType } from "unleash-server";

import azureAdminOauth from "./azure-auth-hook";

const options: IUnleashOptions = {
  authentication: {
    type: IAuthType.CUSTOM,
    customAuthHandler: azureAdminOauth,
  }
};

unleash.start(options).then((instance) => {
  console.log(
    `Unleash started on http://localhost:${instance.app.get("port")}`,
  );
});
