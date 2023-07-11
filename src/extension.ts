import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let copyLinesNumbered = vscode.commands.registerCommand('copylines.copylinesnumbered', () => {
		// Get the active text editor. If there isn't one, we can't copy anything.
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("No editor to copy from!");
			return;
		}

		// Set formatting markers based on formatting configuration setting
		const formatting = vscode.workspace.getConfiguration().get("copylines.formatting");
		let boldPrefix = "";
		let boldSuffix = "";
		let codePrefix = "";
		let codeSuffix = "";
		if (formatting === "markdown") {
			boldPrefix = "__";
			boldSuffix = "__";
			codePrefix = "```\n";
			codeSuffix = "```\n";
		} else if (formatting === "textile") {
			boldPrefix = "*";
			boldSuffix = "*";
			codePrefix = "bc. ";
			codeSuffix = "";
		}

		// Get the document in the current editor, and its file name
		const document = editor.document;
		let fileName = vscode.workspace.asRelativePath(document.uri);

		// Get the current selection line number bounds
		const selection = editor.selection;
		const start = selection.start.line;
		const end = selection.end.line;
		const lineNumberStringWidth = (end + 1).toString().length;

		// The text we are copying starts with the file name and the line number(s)
		let lines = `${boldPrefix}${fileName}${boldSuffix}, `;
		if(start === end) {
			lines += `line ${start + 1}`;
		} else  {
			lines += `lines ${start + 1} - ${end + 1}`;
		}
		lines += `:\n\n${codePrefix}`;

		// Append each line in the selection
		for (let i = selection.start.line; i <= selection.end.line; i++) {
			let lineNumberString = (i+1).toString().padStart(lineNumberStringWidth, " ");
			lines += `${lineNumberString} ${document.lineAt(i).text}\n`;
		}

		lines += codeSuffix;

		// Copy lines to clipboard, and notify user upon success
		vscode.env.clipboard.writeText(lines).then( () => {
			vscode.window.showInformationMessage(`Copied ${end - start + 1} lines`);
		});
	});

	context.subscriptions.push(copyLinesNumbered);
}

export function deactivate() {}
