import type { Html } from "@effect/ui/html";

export const SkeletonBox = <M>(h: Html.H<M>, cls: string) =>
	h.div.class("skeleton-box", cls);
