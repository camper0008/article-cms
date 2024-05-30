export type IsoTimestamp = string;

export type Id = string;

export interface Post {
    id: Id;
    title: string;
    md_content: string;
    html_content: string;
    created: IsoTimestamp;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export interface Db {
    posts(offset: number, limit: number): Result<Post[], string>;
    create_post(post: Omit<Post, "id">): Result<Id, string>;
    update_post(post: Post): Result<null, string>;
    delete_post(id: Id): Result<null, string>;
}
