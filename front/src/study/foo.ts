import { serve } from "https://deno.land/std@0.137.0/http/server.ts";

Deno.permissions.request({ name: "net" });

console.info("hello, world!");
const handler = (req: Request): Response => {
  return new Response("hello, world!");
};
serve(handler);
