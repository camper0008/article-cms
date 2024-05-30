import { Db, Id, Post, Result } from "./mod.ts";

export class FileDb implements Db {
    private path: string;
    constructor(path: string) {
        this.path = path;
    }

    posts(offset: number, limit: number): Result<Post[], string> {
        throw new Error("Method not implemented.");
    }
    create_post(post: Omit<Post, "id">): Result<Id, string> {
        throw new Error("Method not implemented.");
    }
    update_post(post: Post): Result<null, string> {
        throw new Error("Method not implemented.");
    }
    delete_post(id: string): Result<null, string> {
        throw new Error("Method not implemented.");
    }
}
