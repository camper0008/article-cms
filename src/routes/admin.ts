import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import { Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";

export function admin(eta: Eta): Router {
    const router = new Router({ prefix: "/admin" });
    router.get("/", (ctx) => {
        const mode = ctx.request.url.searchParams.get("mode");
        ctx.response.body = eta.render("admin.eta", { mode });
    });
    return router;
}
