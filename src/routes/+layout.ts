import type { LayoutLoad } from "./$types";

export const ssr: boolean = false;
export const prerender: boolean = true;
export const trailingSlash: string = "always";

// 導航列表
var navigations: [string, string][] = [
    ["首頁·友鏈列表", "/"],
    ["倉輸入法·工具", "/hamster-tools/"],
    //["雞蛋餅·主頁", "/wafel/"],
];
// 鳴謝列表
var credits: [string, string][] = [
    ["Svelte Kit", "https://kit.svelte.dev"],
    ["Skeleton", "https://www.skeleton.dev"],
    ["Tailwind CSS", "https://tailwindcss.com"],
];

export const load: LayoutLoad = (_) => {
    return {
        navigations: navigations,
        credits: credits,
    };
};
