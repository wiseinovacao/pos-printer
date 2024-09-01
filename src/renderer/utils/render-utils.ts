import { PosPrintData, PrintDataStyle } from "../../main/types/printer-types";

type PageElement = HTMLElement | HTMLDivElement | HTMLImageElement;
export function generatePageText(arg: PosPrintData) {
	const text = arg.value;
	let div = document.createElement("div") as HTMLElement;
	div.innerHTML = text as string;
	div = applyElementStyles(div, arg.style as PrintDataStyle) as HTMLElement;

	return div;
}

export function applyElementStyles(
	element: PageElement,
	style: PrintDataStyle,
): PageElement {
	for (const styleProp of Object.keys(style)) {
		if (!style[styleProp]) {
			continue;
		}
		element.style[styleProp] = style[styleProp];
	}
	return element;
}
