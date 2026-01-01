import { createApp } from "./app.js";
import { config } from "@config/env.config.js";

function bootstrap() {
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`Server listening on PORT: ${config.port}`);
  });
}

bootstrap();
