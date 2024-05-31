import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { CreatePost, Db, Id, Post, SortedBy, UpdatePost } from "./mod.ts";
import { Result } from "../utils/result.ts";

function new_post_position(
    sorted_posts: Post[],
    new_post: Post,
    sorted_by: SortedBy,
): number {
    switch (sorted_by) {
        case "none":
            return sorted_posts.length;
        case "created": {
            const position = (() => {
                let min = 0;
                let max = sorted_posts.length;
                const new_date = new Date(new_post.created);
                while (true) {
                    if (min === max) {
                        return min;
                    }
                    const curr = Math.floor((max - min) / 2) + min;
                    const curr_date = new Date(sorted_posts[curr].created);
                    if (curr_date.getTime() < new_date.getTime()) {
                        max = curr;
                    } else if (curr_date.getTime() > new_date.getTime()) {
                        min = curr + 1;
                    } else {
                        return curr;
                    }
                }
            })();
            return position;
        }
    }
}

export class FileDb implements Db {
    private directory: string;
    constructor(directory: string) {
        try {
            const info = Deno.statSync(directory);
            if (!info.isDirectory) {
                throw new Error(`Path ${directory} is not a valid directory`);
            }
        } catch {
            Deno.mkdir(directory);
        }
        this.directory = directory;
    }
    async post_with_id(id: string): Promise<Result<Post, string>> {
        const post = await this.load_post_from_disk(id);
        return { ok: true, value: post };
    }
    async total_posts(): Promise<Result<number, string>> {
        return { ok: true, value: await this.count_posts() };
    }
    async posts(
        offset: number,
        limit: number,
        sorted_by: SortedBy,
    ): Promise<Result<Post[], string>> {
        const result: Post[] = [];
        const files = Deno.readDir(this.directory);
        for await (const file of files) {
            const content = await Deno.readTextFile(
                join(this.directory, file.name),
            );
            const obj: Post = JSON.parse(content);
            const position = new_post_position(result, obj, sorted_by);
            const rest = result.splice(position);
            result.push(obj, ...rest);
            if (result.length > offset + limit) {
                result.splice(offset + limit);
            }
        }
        return { ok: true, value: result.splice(offset, limit) };
    }
    async create_post(post: CreatePost): Promise<Result<Id, string>> {
        const files = Deno.readDir(this.directory);
        let highest_id = 0;
        for await (const file of files) {
            const id = this.id_from_file_name(file.name);
            if (!id) {
                return {
                    ok: false,
                    error: `could not get id from file name ${file.name}`,
                };
            }
            const parsed_id = parseInt(id);
            if (highest_id < parsed_id) {
                highest_id = parsed_id;
            }
        }
        const new_post: Post = {
            id: (highest_id + 1).toString(),
            ...post,
        };

        this.save_post_to_disk(new_post);

        return { ok: true, value: highest_id.toString() };
    }
    async update_post(
        post: UpdatePost,
    ): Promise<Result<null, string>> {
        const old_post = await this.load_post_from_disk(post.id);
        await this.save_post_to_disk({ ...old_post, ...post });
        return { ok: true, value: null };
    }
    async delete_post(id: Id): Promise<Result<null, string>> {
        const file_name = this.file_name_from_id(id);
        await Deno.remove(join(this.directory, file_name));
        return { ok: true, value: null };
    }

    private async count_posts(): Promise<number> {
        const posts = Deno.readDir(this.directory);
        let count = 0;
        for await (const _ of posts) {
            count += 1;
        }
        return count;
    }

    private file_name_from_id(id: Id) {
        return `post-${id}.json`;
    }
    private id_from_file_name(file_name: string): Id | null {
        const matches = file_name.match(
            /post\-(\d+)\.json/,
        );
        if (!matches) {
            return null;
        }
        const id = matches[1];
        if (!id) {
            return null;
        }
        try {
            return parseInt(id).toString();
        } catch {
            return null;
        }
    }
    private async load_post_from_disk(id: Id): Promise<Post> {
        const file_name = this.file_name_from_id(id);
        return JSON.parse(
            await Deno.readTextFile(
                join(this.directory, file_name),
            ),
        );
    }
    private async save_post_to_disk(post: Post) {
        const file_name = this.file_name_from_id(post.id);
        await Deno.writeTextFile(
            join(this.directory, file_name),
            JSON.stringify(post),
        );
    }
}
