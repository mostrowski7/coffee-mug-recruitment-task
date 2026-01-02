import { env } from "@config";
import { createApp } from "./app.js";

function bootstrap() {
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Server listening on PORT: ${env.port}`);
  });
}

bootstrap();
