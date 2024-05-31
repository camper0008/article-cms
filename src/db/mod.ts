import { Result } from "../utils/result.ts";

export type IsoTimestamp = string;

export type Id = string;

export interface Post {
    id: Id;
    title: string;
    md_content: string;
    html_content: string;
    created: IsoTimestamp;
}

export type SortedBy = "created" | "none";

export type CreatePost = Omit<Post, "id">;

export type UpdatePost = Omit<Post, "created">;

export interface Db {
    total_posts(): Promise<Result<number, string>>;
    posts(
        offset: number,
        limit: number,
        sorted_by: SortedBy,
    ): Promise<Result<Post[], string>>;
    post_with_id(id: Id): Promise<Result<Post, string>>;
    create_post(post: CreatePost): Promise<Result<Id, string>>;
    update_post(post: UpdatePost): Promise<Result<null, string>>;
    delete_post(id: Id): Promise<Result<null, string>>;
}
