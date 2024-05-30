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

export type SortedBy = "created" | "none";

export interface Db {
    posts(
        offset: number,
        limit: number,
        sorted_by: SortedBy,
    ): Promise<Result<Post[], string>>;
    create_post(post: Omit<Post, "id">): Promise<Result<Id, string>>;
    update_post(post: Post): Promise<Result<null, string>>;
    delete_post(id: Id): Promise<Result<null, string>>;
}
