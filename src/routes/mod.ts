export { admin } from "./admin.ts";
export { posts } from "./posts.ts";

import { Id, Post } from "../db/mod.ts";
import { format_date } from "../utils/format_date.ts";
import { slugify_title } from "../utils/slugify_title.ts";

export interface PostEntry {
    id: Id;
    title: string;
    slug: string;
    content: string | null;
    pretty_date: string;
    iso_date: string;
}

export function post_to_post_entry(post: Post): PostEntry {
    const entry: PostEntry = {
        id: post.id,
        title: post.title,
        slug: slugify_title(post.title),
        pretty_date: format_date(new Date(post.created)),
        iso_date: post.created,
        content: null,
    };
    return entry;
}

export function post_to_post_entry_with_content(post: Post): PostEntry {
    const entry: PostEntry = {
        id: post.id,
        title: post.title,
        slug: slugify_title(post.title),
        pretty_date: format_date(new Date(post.created)),
        iso_date: post.created,
        content: post.html_content,
    };
    return entry;
}
