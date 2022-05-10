import { Application, Router, Status } from "oak";
import { TodoRepo } from "./todo.ts";

const app = new Application();
const todoRepo = new TodoRepo();

const router = new Router();

const TODO_PATH = "/todo";
router.options(TODO_PATH, async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "*");
  ctx.response.headers.set("Access-Control-Allow-Headers", "*");
  ctx.response.status = Status.NoContent;
  await next();
});

router.get(TODO_PATH, async (ctx, next) => {
  console.info(`${JSON.stringify(ctx.response.body)}`);
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.body = JSON.stringify(todoRepo.list());
  ctx.response.type = "json";
  ctx.response.status = Status.OK;
  await next();
});

router.post(TODO_PATH, async (ctx, next) => {
  const body = await ctx.request.body();
  console.info(`post ${body.type} - ${JSON.stringify(await body.value)}`);
  if (body.type == "json") {
    try {
      const todoValue = (await body.value).value;
      if (todoValue) {
        ctx.response.headers.set("Access-Control-Allow-Origin", "*");
        ctx.response.body = todoRepo.add(todoValue);
        ctx.response.type = "json";
        ctx.response.status = Status.OK;
      }
      await next();
    } catch (e) {
      console.info(JSON.stringify(e));
    }
  }
});

router.delete(`${TODO_PATH}/:id`, async (ctx, next) => {
  console.info(`delete ${ctx.params.id}`);
  todoRepo.delete(Number.parseInt(ctx.params.id));
  ctx.response.status = Status.OK;
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ hostname: "localhost", port: 8000 });
