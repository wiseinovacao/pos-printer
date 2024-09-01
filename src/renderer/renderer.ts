import "./index.css";
import { generatePageText } from "./utils/render-utils";

const ipcRender = require("electron").ipcRenderer;

const body = document.getElementById("main") as HTMLElement;

ipcRender.on("body-init", (event, arg) => {
	body.style.width = arg?.width || "100%";
	body.style.margin = arg?.margin || 0;

	event.sender.send("body-init-reply", { status: true, error: null });
});

ipcRender.on("render-line", renderDataToHTML);

async function renderDataToHTML(event, arg) {
	switch (arg.line.type) {
		case "text":
			try {
				body.appendChild(generatePageText(arg.line));

				event.sender.send("render-line-reply", { status: true, error: null });
			} catch (e) {
				event.sender.send("render-line-reply", {
					status: false,
					error: (e as any).toString(),
				});
			}
			return;
	}
}
