import { PosPrintData } from "src/main";
import "./index.css";
import { generatePageText } from "./utils/render-utils";

const ipcRender = require("electron").ipcRenderer;

const body = document.getElementById("main") as HTMLElement;

ipcRender.on("body-init", (event, arg) => {
	body.style.width = arg?.width || "100%";
	body.style.margin = arg?.margin || 0;

	event.sender.send("body-init-reply", { status: true, error: null });
});

ipcRender.on("render-lines", renderDataToHTML);

// TODO: Add support for more types of data (images, tables, etc.)
async function renderDataToHTML(event, data: PosPrintData[]) {
	for (const line of data) {
		switch (line.type) {
			case "text":
				body.appendChild(generatePageText(line));

				break;
		}
	}

	event.sender.send("render-lines-reply", { status: true, error: null });
}
