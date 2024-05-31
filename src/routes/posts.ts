import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import { Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import { Db } from "../db/mod.ts";
import { log } from "../utils/log.ts";
import { post_to_post_entry, post_to_post_entry_with_content } from "./mod.ts";

export function posts(db: Db, eta: Eta, dirname: string): Router {
    const router = new Router();
    router.get("/static/:path+", async (ctx) => {
        await ctx.send({
            root: dirname,
        });
    });
    router.get("/posts/:id/:slug", async (ctx) => {
        const post = await db.post_with_id(ctx.params.id);
        if (!post.ok) {
            return post.error;
        }
        ctx.response.body = eta.render(
            "post.eta",
            post_to_post_entry_with_content(post.value),
        );
    });
    router.get("/posts", async (ctx) => {
        const page = parseInt(ctx.request.url.searchParams.get("page") ?? "1");
        const posts_per_page = 20;
        const idx = (page - 1) * posts_per_page;
        const posts = await db.posts(idx, posts_per_page, "created");
        if (!posts.ok) {
            ctx.response.body = "an error occurred fetching posts";
            log(posts.error, "error");
            return;
        }
        const total_posts = await db.total_posts();
        if (!total_posts.ok) {
            ctx.response.body = "an error occurred fetching posts";
            log(total_posts.error, "error");
            return;
        }
        const max_page = Math.floor(total_posts.value / posts_per_page) + 1;

        ctx.response.body = eta.render("posts.eta", {
            page,
            max_page,
            posts: posts.value.map(post_to_post_entry),
        });
    });
    router.get("/", async (ctx) => {
        const max_recent_posts = 5;
        const posts = await db.posts(0, max_recent_posts, "created");
        if (!posts.ok) {
            ctx.response.body = "an error occurred fetching posts";
            log(posts.error, "error");
            return;
        }
        ctx.response.body = eta.render("front-page.eta", {
            recent_posts: posts.value.map(post_to_post_entry),
        });
    });
    return router;
}
