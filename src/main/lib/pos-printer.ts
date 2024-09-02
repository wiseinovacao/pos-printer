import { PosPrintData, PosPrintOptions } from "../types/printer-types";
import { BrowserWindow } from "electron";
import { join } from "node:path";
import {
	convertPixelsToMicrons,
	parsePaperSize,
	parsePaperSizeInMicrons,
	sendIpcMsg,
} from "../utils/printer-utils";

export class PosPrinter {
	public print(data: PosPrintData[], options: PosPrintOptions): Promise<any> {
		return new Promise((resolve, reject) => {
			// Reject if printer name is not provided and silent is not set
			if (!options.preview && !options.printerName && !options.silent) {
				return reject(
					new Error(
						"A printer name is required; if you don't want to specify a printer name, set silent to true.",
					),
				);
			}

			// Reject if pageSize is an object and height or width is not provided
			if (typeof options.pageSize === "object") {
				if (!options.pageSize.height || !options.pageSize.width) {
					return reject(
						new Error(
							"Height and width properties are required for options.pageSize.",
						),
					);
				}
			}

			const mainWindow = new BrowserWindow({
				...parsePaperSize(options.pageSize),
				show: !!options.preview,
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false,
				},
			});

			mainWindow.on("closed", () => {
				console.log("Destroying window...");
				mainWindow.destroy();
			});

			mainWindow.loadFile(
				options.pathTemplate || join(__dirname, "renderer/index.html"),
			);

			mainWindow.webContents.on("did-finish-load", async () => {
				try {
					await sendIpcMsg("body-init", mainWindow.webContents, options);

					await PosPrinter.renderPrintDocument(mainWindow, data);

					let { width, height } = parsePaperSizeInMicrons(options.pageSize);
					if (typeof options.pageSize === "string") {
						const clientHeight = await mainWindow.webContents.executeJavaScript(
							"document.body.clientHeight",
						);
						height = convertPixelsToMicrons(clientHeight);
					}

					if (!options.preview) {
						console.log("Printing...");
						mainWindow.webContents.print(
							{
								silent: !!options.silent,
								printBackground: !!options.printBackground,
								deviceName: options.printerName,
								copies: options.copies || 1,
								pageSize: { width, height },
								...(options.header && { header: options.header }),
								...(options.footer && { footer: options.footer }),
								...(options.color && { color: options.color }),
								...(options.margins && { margins: options.margins }),
								...(options.landscape && { landscape: options.landscape }),
								...(options.scaleFactor && {
									scaleFactor: options.scaleFactor,
								}),
								...(options.pagesPerSheet && {
									pagesPerSheet: options.pagesPerSheet,
								}),
								...(options.collate && { collate: options.collate }),
								...(options.pageRanges && { pageRanges: options.pageRanges }),
								...(options.duplexMode && { duplexMode: options.duplexMode }),
								...(options.dpi && { dpi: options.dpi }),
							},
							(success, err) => {
								if (err) {
									return reject(err);
								}

								resolve({ complete: success, options });
								mainWindow.close();
							},
						);
					} else {
						resolve({ complete: true, data, options });
					}
				} catch (err) {
					reject(err);
				}
			});
		});
	}

	private static async renderPrintDocument(
		window: BrowserWindow,
		data: PosPrintData[],
	): Promise<any> {
		// biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
		return new Promise(async (resolve, reject) => {
			const result: any = await sendIpcMsg(
				"render-lines",
				window.webContents,
				data,
			);

			if (!result.status) {
				return reject(result.error);
			}

			resolve({ message: "page-rendered" });
		});
	}
}
