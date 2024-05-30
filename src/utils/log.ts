export function log(
    message: string,
    level: "fatal error" | "error" | "warning" | "info" = "info",
) {
    console.log(`${level}: ${message}`);
    if (level === "fatal error") {
        throw new Error("fatal error reached");
    }
}
