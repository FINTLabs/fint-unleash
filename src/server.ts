import unleash, {
  IAuthType,
  IUnleash,
  IUnleashOptions,
  LogLevel,
} from "unleash-server";
import {
  parseEnvVarBoolean,
  parseEnvVarNumber,
} from "unleash-server/dist/lib/util";
import { createConfig } from "unleash-server/dist/lib/create-config";

import createAzureAuthHandler from "./azure-auth-handler";

export default async function flaisleash(start: boolean): Promise<IUnleash> {
  const azureAuthHandler = await createAzureAuthHandler();
  const unleashOptions: IUnleashOptions = {
    authentication: {
      type: IAuthType.CUSTOM,
      customAuthHandler: azureAuthHandler,
      createAdminUser: false,
      enableApiToken: parseEnvVarBoolean(
        process.env.AUTH_ENABLE_API_TOKEN || "true",
        true,
      ),
      initApiTokens: [],
    },
    server: {
      enableRequestLogger: true,
      baseUriPath: "",
      port: parseEnvVarNumber(process.env.SERVER_PORT || "4242", 4242),
    },
    versionCheck: {
      enable: false,
    },
    logLevel: process.env.LOG_LEVEL
      ? (LogLevel as any)[process.env.LOG_LEVEL]
      : LogLevel.warn,
  };

  const config = createConfig(unleashOptions);
  const logger = config.getLogger("flais/server.js");

  logger.info("Azure auth handler created successfully");

  if (start) {
    logger.info("Starting Unleash server with options: ", unleashOptions);
    return unleash.start(config);
  } else {
    return unleash.create(config);
  }
}
