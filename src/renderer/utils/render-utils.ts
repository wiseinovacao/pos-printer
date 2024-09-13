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
	style?: PrintDataStyle,
): PageElement {
	if (!style) {
		return element;
	}

	for (const styleProp of Object.keys(style)) {
		if (!style[styleProp]) {
			continue;
		}
		element.style[styleProp] = style[styleProp];
	}
	return element;
}

export function generateTableCell(arg, type = "td"): HTMLElement {
	const text = arg.value;

	let cellElement: HTMLElement;

	cellElement = document.createElement(type);
	cellElement.innerHTML = text;
	cellElement = applyElementStyles(cellElement, {
		padding: "8px 4px",
		...arg.style,
	});

	return cellElement;
}
