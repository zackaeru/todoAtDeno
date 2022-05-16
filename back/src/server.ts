import { Application, Router, RouterContext, RouterMiddleware, Status } from "oak";
import { TodoRepo } from "./todo.ts";

const todoRepo = new TodoRepo();

const app = new Application();
const router = new Router();

const PORT = 8000
const HOSTNAME = "localhost";
const TODO_PATH:string = "/todo";

//fileからlocalhost通すためにCORS有効にしました
const experimentalCorsResponse:RouterMiddleware<string> = async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "*");
  ctx.response.headers.set("Access-Control-Allow-Headers", "*");
  ctx.response.status = Status.NoContent;
  await next();
};

router.options(TODO_PATH, experimentalCorsResponse);
router.get(TODO_PATH, async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.body = JSON.stringify(todoRepo.list());
  ctx.response.type = "json";
  ctx.response.status = Status.OK;
  await next();
});
router.post(TODO_PATH, async (ctx, next) => {
  const body = await ctx.request.body();
  if (body.type == "json") {
      const todoValue = (await body.value).value;
      if (todoValue) {
        ctx.response.headers.set("Access-Control-Allow-Origin", "*");
        ctx.response.body = todoRepo.add(todoValue);
        ctx.response.type = "json";
        ctx.response.status = Status.OK;
        await next();
      }
      else {
        ctx.response.headers.set("Access-Control-Allow-Origin", "*");
        ctx.response.body = "todo value is empty";
        ctx.response.type = "text/plain";
        ctx.response.status = Status.BadRequest;
        await next();
      }
  }
});

router.options(`${TODO_PATH}/:id`,experimentalCorsResponse );
router.delete(`${TODO_PATH}/:id`, async (ctx, next) => {
  todoRepo.delete(Number.parseInt(ctx.params.id));
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.status = Status.NoContent;
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ hostname: HOSTNAME, port: PORT});
