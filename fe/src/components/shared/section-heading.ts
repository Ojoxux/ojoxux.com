import type { Html } from "@effect/ui/html";

export const SectionHeading = <M>(h: Html.H<M>, label: string) =>
	h.h2.class("section-heading").children(label);
