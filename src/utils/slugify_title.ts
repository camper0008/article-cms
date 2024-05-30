export function slugify_title(title: string): string {
    return title.toLowerCase().replaceAll(" ", "-").replaceAll(/[^\w-_]+/g, "");
}
