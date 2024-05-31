import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import * as routes from "./routes/mod.ts";
import { log } from "./utils/log.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { FileDb } from "./db/file_db.ts";

interface AppState {
    eta: Eta;
}

async function main() {
    const dirname = import.meta.dirname;
    if (!dirname) {
        log("unable to read dirname", "fatal error");
        return;
    }
    const port = 8000;
    const eta = new Eta({ views: join(dirname, "views") });
    const app = new Application<AppState>({
        state: {
            eta,
        },
    });
    const db = new FileDb(join(Deno.cwd(), "file_db"));
    const router = new Router<AppState>();
    router.use(routes.admin(db, eta).routes());
    router.use(routes.posts(db, eta, dirname).routes());
    app.use(router.routes());

    console.log("running on http://localhost:8000");
    await app.listen({ port });
}

main();
