import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { Db, Id, Post, Result, SortedBy } from "./mod.ts";

function new_post_position(
    posts: Post[],
    new_post: Post[],
    sorted_by: SortedBy,
): number {
    if (sorted_by === "none") {
        return new_post.length;
    } else if (sorted_by === "created")
        throw new Error("Method not implemented.");
    }
}

export class FileDb implements Db {
    private directory: string;
    constructor(directory: string) {
        const info = Deno.statSync(directory);
        if (!info.isDirectory) {
            throw new Error(`Path ${directory} is not a valid directory`);
        }
        this.directory = directory;
    }
    async posts(
        offset: number,
        limit: number,
        sorted_by: SortedBy,
    ): Promise<Result<Post[], string>> {
        const result = [];
        const files = Deno.readDir(this.directory);
        for await (const file of files) {
            const content = await Deno.readTextFile(
                join(this.directory, file.name),
            );
            const obj: Post = JSON.parse(content);
            if (result.length < limit) {
                result.push(obj);
            }
        }

        throw new Error("Method not implemented.");
    }
    async create_post(post: Omit<Post, "id">): Promise<Result<string, string>> {
        throw new Error("Method not implemented.");
    }
    async update_post(post: Post): Promise<Result<null, string>> {
        throw new Error("Method not implemented.");
    }
    async delete_post(id: Id): Promise<Result<null, string>> {
        throw new Error("Method not implemented.");
    }
}
