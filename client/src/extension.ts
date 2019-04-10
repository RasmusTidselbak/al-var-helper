'use strict';

import * as path from 'path';

import { workspace, ExtensionContext, commands, window, Selection, Range, Position } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';
import { VariableHandler } from "./components/variable";
import { KeywordHandler } from './components/keyword';

export function activate(context: ExtensionContext) {

	let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
	let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	}

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: ['al'],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'alVarHelper',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	}

	// Create the language client and start the client.
	let disposable = new LanguageClient('alVarHelper', 'AL Variable Helper', serverOptions, clientOptions).start();

	let localVarDisp = commands.registerCommand('alvarhelper.LocalVars', () => {
		let editor = window.activeTextEditor;

		let selectedRange: Range = editor.selection;
		let lastline: number = selectedRange.end.line;
		let varLine: number = -1;
		for (let i = lastline; i >= 0; i--) {
			let currLine = editor.document.lineAt(i);
			let currLineText = currLine.text.trim()
			if (currLineText.toUpperCase() === "VAR") {
				varLine = i;
				break;
			} else if (currLineText.toUpperCase().indexOf("TRIGGER") >= 0 || currLineText.toUpperCase().indexOf("PROCEDURE") >= 0) {
				if (i === lastline) {
					varLine = i + 1;
				}
				break;
			}
		}

		if (varLine >= 0) {
			let range = editor.document.lineAt(varLine).range;
			editor.selection = new Selection(range.end, range.end);
			let revealRange = new Range(new Position(range.end.line - 10, 0), new Position(range.end.line + 10, 0));
			editor.revealRange(revealRange);

		}
	});

	context.subscriptions.push(localVarDisp);

	let globalVarDisp = commands.registerCommand("alvarhelper.GlobalVars", () => {
		// look for var with no trigger og procedure before it
		let editor = window.activeTextEditor;
		let varLine: number = -1;
		let ignoreNext: boolean = false;
		for (let i = 0; i < editor.document.lineCount; i++) {
			let currLine = editor.document.lineAt(i);
			let currLineText = currLine.text.trim();
			if (currLineText.toUpperCase().indexOf("TRIGGER") >= 0 || currLineText.toUpperCase().indexOf("PROCEDURE") >= 0) {
				ignoreNext = true;
			} else if (currLineText.toUpperCase() === "VAR") {
				if (ignoreNext) {
					ignoreNext = false;
				} else {
					varLine = i;
					break;
				}

			} else if (currLineText.toUpperCase().indexOf("BEGIN") >= 0) {
				ignoreNext = false;
			}

		}

		if (editor && varLine >= 0) {
			let range = editor.document.lineAt(varLine).range;
			editor.selection = new Selection(range.end, range.end);
			let revealRange = new Range(new Position(range.end.line - 10, 0), new Position(range.end.line + 10, 0));
			editor.revealRange(revealRange);
		}
	});

	context.subscriptions.push(globalVarDisp);



	let fixCasingDisp = commands.registerCommand("alvarhelper.FixCasing", () => {
		// fixCasing
		let keywordHandler: KeywordHandler = new KeywordHandler();

		let editor = window.activeTextEditor;
		let doc: string = editor.document.getText();

		doc = keywordHandler.casing(doc);

		let lines = doc.split(/\r?\n/g);

		editor.edit(
			function (builder) {
				lines.forEach((line, i) => {
					let lineRange: Range = new Range(new Position(i, 0), new Position(i, Number.MAX_VALUE));
					builder.replace(lineRange, line);
				});
			}
		);
	});
	context.subscriptions.push(fixCasingDisp);

	let sortVariablesDisp = commands.registerCommand("alvarhelper.SortVariables", () => {
		// sortVariables
		let variableHandler: VariableHandler = new VariableHandler();

		let editor = window.activeTextEditor;
		let doc: string = editor.document.getText();

		doc = variableHandler.sort(doc);

		let lines = doc.split(/\r?\n/g);

		editor.edit(
			function (builder) {
				lines.forEach((line, i) => {
					let lineRange: Range = new Range(new Position(i, 0), new Position(i, Number.MAX_VALUE));
					builder.replace(lineRange, line);
				});
			}
		);
		// lines.forEach((line, i) => {
		// 	window.activeTextEditor.edit(
		// 		function (builder) {
		// 			let lineRange: Range = new Range(new Position(i, 0), new Position(i, Number.MAX_VALUE));
		// 			builder.replace(lineRange, line);
		// 		}
		// 	)
		// })
	});

	context.subscriptions.push(sortVariablesDisp);

	let translateDisp = commands.registerCommand("alvarhelper.TranslateVariables", () => {
		const bluebird = require('bluebird');
		const fs = bluebird.promisifyAll(require('fs'));
		const translate = require('./components/translate');

		fs
			.readFileAsync(path.resolve('C:/Users/raa/Documents/Development/NAV/BilagScan/app/Translations/Invoice Import.g.xlf'))
			.then((xlf: any) => {
				return translate(xlf, 'en', 'da');
			})
			.then((output: any) => {
				return fs.writeFileAsync('C:/Users/raa/Documents/Development/NAV/BilagScan/app/Translations/Invoice Import.dk.xlf', output);
			})
			.then(() => {
				console.log('done');
			})
			.catch((err:any) => {
				console.log(err);
			});
	});

	context.subscriptions.push(translateDisp);

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}
