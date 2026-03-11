import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    layout("components/AppLayout.tsx", [
        index("routes/home.tsx"),
        route("dashboard", "routes/dashboard.tsx"),
        route("builder", "routes/builder.tsx"),
    ]),
    route("api/parse-resume", "routes/api/parse-resume.ts"),
    route("api/analyze", "routes/api/analyze.ts"),
    route("api/features/rewrite-bullet", "routes/api/features/rewrite-bullet.ts"),
    route("api/features/cover-letter", "routes/api/features/cover-letter.ts"),
    route("api/features/interview-questions", "routes/api/features/interview-questions.ts"),
    route("api/features/ats-check", "routes/api/features/ats-check.ts"),
    route("api/features/tailor", "routes/api/features/tailor.ts"),
    route("api/features/generate-summary", "routes/api/features/generate-summary.ts"),
] satisfies RouteConfig;
