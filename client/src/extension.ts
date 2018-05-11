'use strict';

import * as path from 'path';

import { workspace, ExtensionContext, commands, window, Selection } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

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
		// if the current line is not procedure or trigger
		// look backwards until you find var/procedure/trigger and set the editor here

		if (editor) {
			let range = editor.document.lineAt(5).range;
			editor.selection = new Selection(range.start, range.end);
			editor.revealRange(range);
		}
	});

	context.subscriptions.push(localVarDisp);

	let globalVarDisp = commands.registerCommand("alvarhelper.GlobalVars", () => {
		// look for var with no trigger og procedure before it

		let editor = window.activeTextEditor;
		if (editor) {
			let range = editor.document.lineAt(5).range;
			editor.selection = new Selection(range.start, range.end);
			editor.revealRange(range);
		}
	});

	context.subscriptions.push(globalVarDisp);

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}
