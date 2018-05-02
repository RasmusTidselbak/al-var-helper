/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	IPCMessageReader, IPCMessageWriter, createConnection, IConnection, TextDocuments, TextDocument, InitializeResult, TextDocumentPositionParams, CompletionItem,
	CompletionItemKind
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize((_params): InitializeResult => {
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind,
			// Tell the client that the server support code complete
			completionProvider: {
				resolveProvider: true
			}
		}
	}
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {

});

// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
});

connection.onDidChangeWatchedFiles((_change) => {
	// Monitored files have change in VSCode
});


// This handler provides the initial list of the completion items.
connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	// The pass parameter contains the position of the text document in
	// which code complete got requested. For the example we ignore this
	// info and always provide the same completion items.

	let txtdoc: TextDocument;
	txtdoc = documents.get(_textDocumentPosition.textDocument.uri);
	let fullDoc = txtdoc.getText();
	let line: string = txtdoc.getText({ start: { line: _textDocumentPosition.position.line, character: 0 }, end: { line: _textDocumentPosition.position.line, character: Number.MAX_VALUE } });
	let startPos: number;
	let endPos: number;

	let CompletionItems: CompletionItem[] = []

	startPos = line.toUpperCase().indexOf("RECORD");
	if (startPos >= 0) {
		startPos += 6;
	}

	if (startPos < 0) {
		startPos = line.toUpperCase().indexOf("CODEUNIT");
		if (startPos >= 0) {
			startPos += 8;
		}
	}

	if (startPos < 0) {
		startPos = line.toUpperCase().indexOf("REPORT");
		if (startPos >= 0) {
			startPos += 5;
		}
	}

	if (startPos < 0) {
		startPos = line.toUpperCase().indexOf("QUERY");
		if (startPos >= 0) {
			startPos += 5;
		}
	}

	if (startPos < 0) {
		startPos = line.toUpperCase().indexOf("PAGE");
		if (startPos >= 0) {
			startPos += 4;
		}
	}

	line = line.substring(startPos);

	if (startPos >= 0) {
		// find ending 
		endPos = line.toUpperCase().indexOf("TEMPORARY");
		if (endPos < 0) {
			endPos = line.toUpperCase().indexOf(";");
		}
	}

	if (startPos >= 0 && endPos >= 0) {
		let exact: string;
		let tag: string;
		let short: string;
		let words: string[];

		line = line.substring(0, endPos);
		exact = line.trim();
		exact = exact.replace(/"/g, '');
		exact = exact.replace(/ /g, "");

		CompletionItems.push({
			label: 'vFull',
			kind: CompletionItemKind.Text,
			data: exact
		});

		if (fullDoc.indexOf(exact) >= 0) {
			CompletionItems.push({
				label: 'vFull2',
				kind: CompletionItemKind.Text,
				data: exact + '2'
			});
		}

		short = line.replace(/"/g, "");
		words = short.split(" ");

		connection.console.log(words.toString());
		words.forEach((word, i) => {
			switch (word.toUpperCase()) {
				case 'MANAGEMENT':
					words[i] = 'Mgt';
					break;
				case 'HEADER':
					words[i] = 'Hdr';
					break;
				default:
					break;
			}
		});

		short = words.join("");

		CompletionItems.push({
			label: 'vShort',
			kind: CompletionItemKind.Text,
			data: short
		});

		tag = line.replace(/[^A-Z]/g, "");
		CompletionItems.push({
			label: 'vTag',
			kind: CompletionItemKind.Text,
			data: tag
		});

		if (fullDoc.indexOf(tag) >= 0) {
			CompletionItems.push({
				label: 'vTag2',
				kind: CompletionItemKind.Text,
				data: tag + '2'
			});
		}

		// return [
		// 	{
		// 		label: 'vFull',
		// 		kind: CompletionItemKind.Text,
		// 		data: exact
		// 	},
		// 	{
		// 		label: 'vTag',
		// 		kind: CompletionItemKind.Text,
		// 		data: tag
		// 	}
		// ]
	}
	return CompletionItems;
});

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	// if (item.data === 1) {
	item.detail = item.data,
		item.documentation = 'Insert ' + item.data,
		item.insertText = item.data;
	// } else if (item.data === 2) {
	// 	item.detail = 'Tag',
	// 		item.documentation = 'Tag of the object'
	// }

	return item;
});

/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();
