import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;

function bootstrap() {
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
  });
}

bootstrap();
