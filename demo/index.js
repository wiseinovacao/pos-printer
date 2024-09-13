const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { PosPrinter } = require("../dist/index");

const createWindow = () => {
	const size = screen.getPrimaryDisplay().size;
	console.log(size);
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	win.loadFile("index.html");
	win.webContents.openDevTools();
};

app.whenReady().then(() => {
	createWindow();
});

ipcMain.on("test-print", testPrint);

function testPrint() {
	const options = {
		preview: true,
		margin: "auto",
		copies: 1,
		printerName: "printerName",
		timeOutPerLine: 1000,
		pageSize: "80mm",
	};

	const data = [
		{
			type: "text",
			value: "SAMPLE HEADING",
			style: { fontWeight: "700", textAlign: "center", fontSize: "24px" },
		},
		{
			type: "text",
			value: "Secondary text",
			style: {
				textDecoration: "underline",
				fontSize: "10px",
				textAlign: "center",
				color: "red",
			},
		},
		{
			type: "table",
			style: { border: "1px solid #dadada", width: "100%" },
			tableHeader: [{ type: "text", value: "User" }],
			tableBody: [
				[{ type: "text", value: "Gabriel" }],
				[{ type: "text", value: "Jones" }],
				[{ type: "text", value: "David" }],
			],
			tableFooter: [{ type: "text", value: "Total: 3" }],
			tableHeaderStyle: { backgroundColor: "blue", color: "white" },
			tableBodyStyle: { border: "0.5px solid #dadada" },
			tableFooterStyle: { backgroundColor: "#000", color: "white" },
		},
	];

	try {
		new PosPrinter()
			.print(data, options)
			.then(() => console.log("done"))
			.catch((error) => {
				console.error(error);
			});
	} catch (e) {
		console.log(PosPrinter);
		console.log(e);
	}
}
