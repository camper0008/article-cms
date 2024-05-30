import { Application, Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

import { format_date } from "./format_date.ts";

function log(
    message: string,
    level: "fatal error" | "error" | "warning" | "info" = "info",
) {
    console.log(`${level}: ${message}`);
    if (level === "fatal error") {
        throw new Error("fatal error reached");
    }
}

interface PostEntry {
    title: string;
    slug: string;
    pretty_date: string;
    iso_date: string;
}

function placeholder_posts(): PostEntry[] {
    const random_posts = new Array(49).fill(0).map((_, idx) => {
        const date = new Date(Math.random() * new Date().getTime());
        const title = `title ${idx + 2}`;
        const post = {
            title: title,
            slug: slugify_title(title),
            pretty_date: format_date(date),
            iso_date: date.toISOString(),
        };
        return post;
    });

    return [{
        title: "title 1",
        slug: slugify_title("title 1"),
        pretty_date: format_date(new Date()),
        iso_date: new Date().toISOString(),
    }, ...random_posts];
}

function sort_posts(posts: PostEntry[]): PostEntry[] {
    return posts.toSorted((a, b) => {
        const a_date = new Date(a.iso_date);
        const b_date = new Date(b.iso_date);
        return a_date < b_date ? 1 : -1;
    });
}

function slugify_title(title: string): string {
    return title.toLowerCase().replaceAll(" ", "-").replaceAll(/[^\w-_]+/g, "");
}

async function main() {
    const dirname = import.meta.dirname;
    if (!dirname) {
        log("unable to read dirname", "fatal error");
        return;
    }
    const port = 8000;
    const eta = new Eta({ views: join(dirname, "views") });

    const router = new Router();
    router.get("/static/:path+", async (ctx) => {
        await ctx.send({
            root: dirname,
        });
    });

    router.get("/posts/:slug", (ctx) => {
        ctx.response.body = eta.render("post.eta", {
            title: "title 1",
            pretty_date: format_date(new Date(), true),
            content: "<h2>hewwo wowld</h2>",
        });
    });

    router.get("/posts", (ctx) => {
        const page = parseInt(ctx.request.url.searchParams.get("page") ?? "1");
        const posts_per_page = 20;
        const idx = (page - 1) * posts_per_page;
        const posts = sort_posts(placeholder_posts());
        const max_page = Math.floor(posts.length / posts_per_page) + 1;

        ctx.response.body = eta.render("posts.eta", {
            page,
            max_page,
            posts: posts.slice(
                idx,
                idx + posts_per_page,
            ),
        });
    });

    router.get("/", (ctx) => {
        const posts = sort_posts(placeholder_posts());
        const max_recent_posts = 5;
        ctx.response.body = eta.render("front-page.eta", {
            recent_posts: posts.slice(0, max_recent_posts),
        });
    });
    const app = new Application();
    app.use(router.routes());
    app.use(router.allowedMethods());

    console.log("running on http://localhost:8000");
    await app.listen({ port });
}

main();
