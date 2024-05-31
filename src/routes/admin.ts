import { Eta } from "https://deno.land/x/eta@v3.1.0/src/index.ts";
import { Router } from "https://deno.land/x/oak@v16.0.0/mod.ts";
import { marky } from "https://deno.land/x/marky@v1.1.6/mod.ts";
import {
    CreatePost as DbCreatePost,
    Db,
    Id,
    Post,
    UpdatePost as DbUpdatePost,
} from "../db/mod.ts";
import { Ok, Result } from "../utils/result.ts";
import { post_to_post_entry, PostEntry } from "./mod.ts";

interface CreatePost {
    title: Post["title"];
    content: Post["md_content"];
}

interface UpdatePost {
    id: Post["id"];
    title: Post["title"];
    content: Post["md_content"];
}

interface DeletePost {
    id: Post["id"];
}

function compile_md_to_html(content: string): string {
    return marky(content);
}

type AdminPageMode = {
    mode: null;
} | {
    mode: "create";
    api_url: string;
} | {
    mode: "edit";
    api_url: string;
    post: Post;
} | {
    mode: "delete";
    api_url: string;
    post: Id;
} | {
    mode: "edit" | "delete";
    post: null;
    posts: PostEntry[];
    page: number;
    max_page: number;
};

async function extract_admin_page_mode(
    db: Db,
    params: URLSearchParams,
): Promise<Result<AdminPageMode, string>> {
    const mode = params.get("mode");
    switch (mode) {
        case "create":
            return Ok({ mode: "create", api_url: "/admin/api/create" });
        case "delete":
        case "edit": {
            const id = params.get("id");
            if (!id) {
                const page = parseInt(params.get("page") ?? "1");
                const posts_per_page = 20;
                const idx = (page - 1) * posts_per_page;
                const posts = await db.posts(idx, posts_per_page, "created");
                if (!posts.ok) {
                    return posts;
                }
                const total_posts = await db.total_posts();
                if (!total_posts.ok) {
                    return total_posts;
                }
                const max_page =
                    Math.floor(total_posts.value / posts_per_page) + 1;

                return Ok({
                    mode,
                    page,
                    max_page,
                    post: null,
                    posts: posts.value.map(post_to_post_entry),
                });
            }
            switch (mode) {
                case "delete": {
                    return Ok({
                        mode: "delete",
                        api_url: "/admin/api/delete",
                        post: id,
                    });
                }
                case "edit": {
                    const post_result = await db.post_with_id(id);
                    if (!post_result.ok) {
                        return post_result;
                    }
                    const post = post_result.value;

                    return Ok({
                        mode: "edit",
                        api_url: "/admin/api/update",
                        post,
                    });
                }
            }
            throw new Error("unreachable");
        }
        default:
            return Ok({ mode: null });
    }
}

export function admin(db: Db, eta: Eta): Router {
    const router = new Router({ prefix: "/admin" });

    router.post("/api/delete", async (ctx) => {
        const body: DeletePost = await ctx.request.body
            .json();
        ctx.response.body = await db.delete_post(body.id);
    });

    router.post("/api/create", async (ctx) => {
        const body: CreatePost = await ctx.request.body
            .json();
        const post: DbCreatePost = {
            title: body.title,
            md_content: body.content,
            html_content: compile_md_to_html(body.content),
            created: new Date().toISOString(),
        };
        ctx.response.body = await db.create_post(post);
    });
    router.post("/api/update", async (ctx) => {
        const body: UpdatePost = await ctx.request.body
            .json();
        const post: DbUpdatePost = {
            id: body.id,
            title: body.title,
            md_content: body.content,
            html_content: compile_md_to_html(body.content),
        };
        ctx.response.body = await db.update_post(post);
    });
    router.get("/", async (ctx) => {
        const mode = await extract_admin_page_mode(
            db,
            ctx.request.url.searchParams,
        );
        if (!mode.ok) {
            ctx.response.body = mode;
        } else {
            ctx.response.body = eta.render("admin.eta", mode.value);
        }
    });
    return router;
}
