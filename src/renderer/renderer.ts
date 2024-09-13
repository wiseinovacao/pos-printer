import { PosPrintData } from "src/main";
import "./index.css";
import {
	applyElementStyles,
	generatePageText,
	generateTableCell,
} from "./utils/render-utils";

const ipcRender = require("electron").ipcRenderer;

const body = document.getElementById("main") as HTMLElement;

ipcRender.on("body-init", (event, arg) => {
	body.style.width = arg?.width || "100%";
	body.style.margin = arg?.margin || 0;

	event.sender.send("body-init-reply", { status: true, error: null });
});

ipcRender.on("render-lines", renderDataToHTML);

// TODO: Add support for more types of data (images, etc.)
async function renderDataToHTML(event, data: PosPrintData[]) {
	for (const [index, line] of data.entries()) {
		switch (line.type) {
			case "text":
				body.appendChild(generatePageText(line));

				break;
			case "table": {
				const tableContainer = document.createElement("div");
				tableContainer.setAttribute("id", `table-container-${index}`);
				let table = document.createElement("table");
				table.setAttribute("id", `table${index}`);
				table = applyElementStyles(table, {
					...line.style,
				}) as HTMLTableElement;

				let tHeader = document.createElement("thead");
				tHeader = applyElementStyles(
					tHeader,
					line.tableHeaderStyle,
				) as HTMLTableSectionElement;

				let tBody = document.createElement("tbody");
				tBody = applyElementStyles(
					tBody,
					line.tableBodyStyle,
				) as HTMLTableSectionElement;

				let tFooter = document.createElement("tfoot");
				tFooter = applyElementStyles(
					tFooter,
					line.tableFooterStyle,
				) as HTMLTableSectionElement;

				if (line.tableHeader) {
					for (const headerArg of line.tableHeader) {
						if (typeof headerArg === "object") {
							if (headerArg.type === "text") {
								tHeader.appendChild(generateTableCell(headerArg, "th"));
							}
						} else {
							const th = document.createElement("th");
							th.innerHTML = headerArg;
							tHeader.appendChild(th);
						}
					}
				}

				if (line.tableBody) {
					for (const bodyRow of line.tableBody) {
						const rowTr = document.createElement("tr");
						for (const colArg of bodyRow) {
							if (typeof colArg === "object") {
								if (colArg.type === "text") {
									rowTr.appendChild(generateTableCell(colArg));
								}
							} else {
								const td = document.createElement("td");
								td.innerHTML = colArg;
								rowTr.appendChild(td);
							}
						}
						tBody.appendChild(rowTr);
					}
				}

				if (line.tableFooter) {
					for (const footerArg of line.tableFooter) {
						if (typeof footerArg === "object") {
							if (footerArg.type === "text") {
								tFooter.appendChild(generateTableCell(footerArg, "th"));
							}
						} else {
							const footerTh = document.createElement("th");
							footerTh.innerHTML = footerArg;
							tFooter.appendChild(footerTh);
						}
					}
				}

				table.appendChild(tHeader);
				table.appendChild(tBody);
				table.appendChild(tFooter);
				tableContainer.appendChild(table);
				body.appendChild(tableContainer);

				break;
			}
		}
	}

	event.sender.send("render-lines-reply", { status: true, error: null });
}
