import "reflect-metadata";
import { createServer } from "./utils/createServer";

const PORT = Number(process.env.PORT) || 4000;
async function main() {
  const { app, server } = await createServer();

  await server.start();

  app.register(
    server.createHandler({
      cors: false,
    })
  );

  await app.listen({
    port: PORT,
  });

  console.log(
    `Server is running on http://localhost:${PORT}${server.graphqlPath}`
  );
}
main();
