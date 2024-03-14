import "utils/db-env";
import flaisleash from "server";

flaisleash(true)
  .then((server) => {
    const port: number = server.app.get("port");
    const logger = server.config.getLogger("flais/index.js");
    logger.debug("Unleash server config: ", server.config);
  })
  .catch((error: Error) => {
    console.error("Unleash server failed to start: ", error);
  });