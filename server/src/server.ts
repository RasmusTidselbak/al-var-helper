/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
"use strict";

import {
  IPCMessageReader,
  IPCMessageWriter,
  createConnection,
  IConnection,
  TextDocuments,
  TextDocument,
  InitializeResult,
  TextDocumentPositionParams,
  CompletionItem,
  CompletionItemKind
} from "vscode-languageserver";

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(
  new IPCMessageReader(process),
  new IPCMessageWriter(process)
);

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
  };
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
// documents.onDidChangeContent(change => {});

// The settings have changed. Is send on server activation
// as well.
// connection.onDidChangeConfiguration(change => {});

// connection.onDidChangeWatchedFiles(_change => {
// Monitored files have change in VSCode
// });

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    connection.workspace.getConfiguration('alvarhelp.ignoreALPrefix');

    let txtdoc: TextDocument;
    txtdoc = documents.get(_textDocumentPosition.textDocument.uri);
    let fullDoc = txtdoc.getText();
    let line: string = txtdoc.getText({
      start: { line: _textDocumentPosition.position.line, character: _textDocumentPosition.position.character },
      end: {
        line: _textDocumentPosition.position.line,
        character: Number.MAX_VALUE
      }
    });
    let startPos: number;
    let endPos: number;
    let tempRec: boolean = false;

    let CompletionItems: CompletionItem[] = [];

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
        startPos += 6;
      }
    }

    if (startPos < 0) {
      startPos = line.toUpperCase().indexOf("XMLPORT");
      if (startPos >= 0) {
        startPos += 7;
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

    if (startPos < 0) {
      startPos = line.toUpperCase().indexOf("TESTPAGE");
      if (startPos >= 0) {
        startPos += 8;
      }
    }

    if (startPos < 0) {
      startPos = line.toUpperCase().indexOf("ENUM");
      if (startPos >= 0) {
        startPos += 4;
      }
    }

    line = line.substring(startPos);

    if (startPos >= 0) {
      // find ending
      endPos = line.toUpperCase().indexOf("TEMPORARY;");
      if (endPos < 0) {
        endPos = line.toUpperCase().indexOf(";");
      } else {
        tempRec = true;
      }
    }

    if (startPos >= 0 && endPos >= 0) {
      let exact: string;
      let tag: string;
      let short: string;
      let words: string[];
      let warn: boolean = false;

      line = line.substring(0, endPos);

      line = line.replace(/"/g, "");
      line = line.trim();

      ignoreALPrefix.forEach((prefix) => {
        let prefixLine = line.substr(0, prefix.length);
        if (prefix === prefixLine) {
          line = line.substr(prefixLine.length);
        }
      });

      ignoreALSuffix.forEach((suffix) => {
        let suffixLine = line.substr(line.length - suffix.length, line.length);
        if (suffix === suffixLine) {
          line = line.substr(0, line.length - suffix.length);
        }
      });

      line = line.trim();

      exact = line.replace(/\W/g, "");
      if (tempRec) {
        exact = "Temp" + exact;
      }

      exact = exact.replace(/^(\d|\.)+/gm, "");
      
      fullDoc.indexOf(exact) >= 0 ? (warn = true) : (warn = false);

      CompletionItems.push({
        label: "vFull",
        kind: CompletionItemKind.Text,
        data: { text: exact, warning: warn }
      });

      short = line.replace(/"/g, "");      
      words = short.match(/[A-Z][a-z]*|[a-z]+/g); // split CollectionOfWords into single words
      short = words.join(" ");
      words = short.split(" ");

      words.forEach((word, i) => {

        switch (word.toUpperCase()) {
          case "ABSENCE":
            words[i] = "Abs";
            break;
          case "ACCOUNT":
            words[i] = "Acc";
            break;
          case "ACCOUNTING":
            words[i] = "Acc";
            break;
          case "ACCUMULATED":
            words[i] = "Accum";
            break;
          case "ACTION":
            words[i] = "Act";
            break;
          case "ACTIVITY":
            words[i] = "Activ";
            break;
          case "ADDITIONAL":
            words[i] = "Add";
            break;
          case "ADDRESS":
            words[i] = "Addr";
            break;
          case "ADJUST":
            words[i] = "Adj";
            break;
          case "ADJUSTED":
            words[i] = "Adjd";
            break;
          case "ADJUSTMENT":
            words[i] = "Adjmt";
            break;
          case "AGREEMENT":
            words[i] = "Agrmt";
            break;
          case "ALLOCATION":
            words[i] = "Alloc";
            break;
          case "ALLOWANCE":
            words[i] = "Allow";
            break;
          case "ALTERNATIVE":
            words[i] = "Alt";
            break;
          case "AMOUNT":
            words[i] = "Amt";
            break;
          case "AMOUNTS":
            words[i] = "Amts";
            break;
          case "ANSWER":
            words[i] = "Ans";
            break;
          case "APPLIES":
            words[i] = "Appl";
            break;
          case "APPLICATION":
            words[i] = "Appln";
            break;
          case "ARRIVAL":
            words[i] = "Arriv";
            break;
          case "ASSEMBLY":
            words[i] = "Asm";
            break;
          case "ASSEMBLE":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "TO" && words[i + 2].toUpperCase() === "ORDER") {
              words[i] = "ATO";
              words[i + 1] = "";
              words[i + 2] = ""
            }
            break;
          case "ASSIGNMENT":
            words[i] = "Assgnt";
            break;
          case "ASSOCIATED":
            words[i] = "Assoc";
            break;
          case "ATTACHMENT":
            words[i] = "Attmt";
            break;
          case "AUTHORITIES":
            words[i] = "Auth";
            break;
          case "AUTOMATIC":
            words[i] = "Auto";
            break;
          case "AVAILABILITY":
            words[i] = "Avail";
            break;
          case "AVERAGE":
            words[i] = "Avg";
            break;
          case "BA":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "DB.") {
              words[i] = "BA";
              words[i + 1] = "";
            }
            break;
          case "BALANCE":
            words[i] = "Bal";
            break;
          case "BILL":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "OF" && words[i + 2].toUpperCase() === "MATERIALS") {
              words[i] = "BOM";
              words[i + 1] = "";
              words[i + 2] = "";
            }

            break;
          case "BLANKET":
            words[i] = "Blnkt";
            break;
          case "BUDGET":
            words[i] = "Budg";
            break;
          case "BUFFER":
            words[i] = "Buf";
            break;
          case "BUSINESS":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "INTERACTION" && words[i + 2].toUpperCase() === "MANAGEMENT") {
              words[i] = "BIM";
              words[i + 1] = "";
              words[i + 2] = "";
            } else {
              words[i] = "Bus";
            }
            break;
          case "BUYING":
            words[i] = "Buy";
            break;
          case "CALCULATE":
            words[i] = "Calc";
            break;
          case "CALCULATED":
            words[i] = "Calcd";
            break;
          case "CALCULATION":
            words[i] = "Calcu";
            break;
          case "CALENDAR":
            words[i] = "Cal";
            break;
          case "CAPACITY":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "REQUIREMENTS" && words[i + 2].toUpperCase() === "PLANNING") {
              words[i] = "CRP";
              words[i + 1] = "";
              words[i + 2] = "";
            } else {
              words[i] = "Cap";
            }
            break;
          case "CASH":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "FLOW") {
              words[i] = "CF";
              words[i + 1] = "";
            }

            break;
          case "CASHFLOW":
            words[i] = "CF";
            break;
          case "CATALOG":
            words[i] = "ctlg";
            break;
          case "CATEGORY":
            words[i] = "Cat";
            break;
          case "CENTRAL":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "PROCESSING" && words[i + 2].toUpperCase() === "UNIT") {
              words[i] = "CPU";
              words[i + 1] = "";
              words[i + 2] = "";
            }

            break;
          case "CENTER":
            words[i] = "Ctr";
            break;
          case "CHANGE":
            words[i] = "Chg";
            break;
          case "CHANGES":
            words[i] = "Chgs";
            break;
          case "CHARACTER":
            words[i] = "Char";
            break;
          case "CHARACTERS":
            words[i] = "Chars";
            break;
          case "CHARGE":
            words[i] = "Chrg";
            break;
          case "CHARGES":
            words[i] = "Chrgs";
            break;
          case "CHECK":
            words[i] = "Chk";
            break;
          case "CLASSIFICATION":
            words[i] = "Class";
            break;
          case "COLLECTION":
            words[i] = "coll";
            break;
          case "COLUMN":
            words[i] = "col";
            break;
          case "COMMENT":
            words[i] = "Cmt";
            break;
          case "COMPANY":
            words[i] = "Comp";
            break;
          case "COMPONENT":
            words[i] = "Comp";
            break;
          case "COMPLETION":
            words[i] = "Cmpltn";
            break;
          case "COMPONENTS":
            words[i] = "Comps";
            break;
          case "COMPOSITION":
            words[i] = "Compn";
            break;
          case "COMPRESSION":
            words[i] = "Compr";
            break;
          case "CONCURRENT":
            words[i] = "Concrnt";
            break;
          case "CONFIDENTIAL":
            words[i] = "Conf";
            break;
          case "CONFIRMATION":
            words[i] = "Cnfrmn";
            break;
          case "CONFLICT":
            words[i] = "Confl";
            break;
          case "CONSOLIDATE":
            words[i] = "Consol";
            break;
          case "CONSOLIDATION":
            words[i] = "Consolid";
            break;
          case "CONSUMPTION":
            words[i] = "Consump";
            break;
          case "CONTACT":
            words[i] = "Cont";
            break;
          case "CONTAINER":
            words[i] = "Cntr";
            break;
          case "CONTRACT":
            words[i] = "Contr";
            break;
          case "CONTRACTED":
            words[i] = "Contrd";
            break;
          case "CONTROL":
            words[i] = "Ctrl";
            break;
          case "CONTROLS":
            words[i] = "Ctrls";
            break;
          case "CONVERSION":
            words[i] = "Conv";
            break;
          case "CORRECTION":
            words[i] = "Cor";
            break;
          case "CORRESPONDENCE":
            words[i] = "Corres";
            break;
          case "CORRESPONDING":
            words[i] = "Corresp";
            break;
          case "COST":
            words[i] = "Cst";
            break;
          case "SOLD":
            words[i] = "COGS";
            break;
          case "CREDIT":
            words[i] = "Cr";
            break;
          case "CUMULATE":
            words[i] = "Cumul";
            break;
          case "CURRENCY":
            words[i] = "Curr";
            break;
          case "CURRENT":
            words[i] = "Crnt";
            break;
          case "CUSTOMER":
            words[i] = "Cust";
            break;
          case "CUSTOMER/VENDOR":
            words[i] = "CV";
            break;
          case "DAILY":
            words[i] = "Dly";
            break;
          case "DAMPENER":
            words[i] = "Damp";
            break;
          case "DATABASE":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "MANAGEMENT" && words[i + 2].toUpperCase() === "SYSTEM") {
              words[i] = "DBMS";
              words[i + 1] = "";
              words[i + 2] = ""
            } else {
              words[i] = "DB";
            }
            break;
          case "DATE":
            words[i] = "D";
            break;
          case "DEFINITION":
            words[i] = "Def";
            break;
          case "DEMONSTRATION":
            words[i] = "Demo";
            break;
          case "DEPARTMENT":
            words[i] = "Dept";
            break;
          case "DEPARTMENT/PROJECT":
            words[i] = "DP";
            break;
          case "DEPRECIATION":
            words[i] = "Depr";
            break;
          case "DESCRIPTION":
            words[i] = "Desc";
            break;
          case "DETAIL":
            words[i] = "Dtl";
            break;
          case "DETAILED":
            words[i] = "Dtld";
            break;
          case "DETAILS":
            words[i] = "Dtls";
            break;
          case "DEVIATION":
            words[i] = "Dev";
            break;
          case "DIFFERENCE":
            words[i] = "Diff";
            break;
          case "DIMENSION":
            words[i] = "Dim";
            break;
          case "DIRECT":
            words[i] = "Dir";
            break;
          case "DISCOUNT":
            words[i] = "Disc";
            break;
          case "DISCRETE":
            words[i] = "Discr";
            break;
          case "DISTRIBUTE":
            words[i] = "Distr";
            break;
          case "DISTRIBUTED":
            words[i] = "Distrd";
            break;
          case "DISTRIBUTOR":
            words[i] = "Distbtr";
            break;
          case "DISTRIBUTION":
            words[i] = "Distrn";
            break;
          case "DOCUMENT":
            words[i] = "Doc";
            break;
          case "DUPLICATE":
            words[i] = "Dupl";
            break;
          case "ENTERED":
            words[i] = "Entrd";
            break;
          case "ENGINEERING":
            words[i] = "Engin";
            break;
          case "EXCHANGE":
            words[i] = "Exch";
            break;
          case "EXCLUDING":
            words[i] = "Excl";
            break;
          case "EXECUTE":
            words[i] = "Exec";
            break;
          case "EXPECTED":
            words[i] = "Expd";
            break;
          case "EXPEDITED":
            words[i] = "Exped";
            break;
          case "EXPENSE":
            words[i] = "Exp";
            break;
          case "EXPRESSION":
            words[i] = "Expr";
            break;
          case "EXPIRATION":
            words[i] = "Expir";
            break;
          case "EXTENDED":
            words[i] = "Ext";
            break;
          case "EXPLODE":
            words[i] = "Expl";
            break;
          case "EXPORT":
            words[i] = "Expt";
            break;
          case "FINAL":
            words[i] = "Fnl";
            break;
          case "FINANCE":
            words[i] = "Fin";
            break;
          case "FISCAL":
            words[i] = "Fisc";
            break;
          case "FINISHED":
            words[i] = "Fnshd";
            break;
          case "FIXED":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "ASSET") {
              words[i] = "FA";
              words[i + 1] = "";
            }
            break;
          case "FORWARD":
            words[i] = "Fwd";
            break;
          case "FREIGHT":
            words[i] = "Frt";
            break;
          case "GENERAL":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "LEDGER") {
              words[i] = "GL";
              words[i + 1] = "";
            } else {
              words[i] = "Gen";
            }
            break;
          case "GROUP":
            words[i] = "Gr";
            break;
          case "HEADER":
            words[i] = "Hdr";
            break;
          case "HISTORY":
            words[i] = "Hist";
            break;
          case "HOLIDAY":
            words[i] = "Hol";
            break;
          case "HUMAN":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "RESOURCE") {
              words[i] = "HR";
              words[i + 1] = "";
            }
            break;
          case "IDENTIFICATION":
            words[i] = "ID";
            break;
          case "IMPORT":
            words[i] = "Imp";
            break;
          case "INBOUND":
            words[i] = "Inbnd";
            break;
          case "INCLUDING":
            words[i] = "Incl";
            break;
          case "INCLUDED":
            words[i] = "Incld";
            break;
          case "INCOMING":
            words[i] = "Incmg";
            break;
          case "INDEPENDENT":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "SOFTWARE" && words[i + 2].toUpperCase() == "VENDOR") {
              words[i] = "ISV";
              words[i + 1] = "";
              words[i + 2] = "";
            }
            break;
          case "INDUSTRY":
            words[i] = "Indust";
            break;
          case "INFORMATION":
            words[i] = "Info";
            break;
          case "INITIAL":
            words[i] = "Init";
            break;
          case "INTRASTAT":
            words[i] = "Intra";
            break;
          case "INTERACTION":
            words[i] = "Interact";
            break;
          case "INTEGRATION":
            words[i] = "Integr";
            break;
          case "INTEREST":
            words[i] = "Int";
            break;
          case "INTERIM":
            words[i] = "Intm";
            break;
          case "INTERNAL":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "PROTOCOL") {
              words[i] = "IP";
              words[i + 1] = "";
            }
            break;
          case "INVENTORY":
            words[i] = "Invt";
            break;
          case "INVENTORIABLE":
            words[i] = "Invtbl";
            break;
          case "INVOICE":
            words[i] = "Inv";
            break;
          case "INVOICED":
            words[i] = "Invd";
            break;
          case "ITEM":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "TRACKING") {
              words[i] = "IT";
              words[i + 1] = "";
            }
            break;
          case "JOURNAL":
            words[i] = "Jnl";
            break;
          case "LANGUAGE":
            words[i] = "Lang";
            break;
          case "LEDGER":
            words[i] = "Ledg";
            break;
          case "LEVEL":
            words[i] = "Lvl";
            break;
          case "LINE":
            words[i] = "Ln";
            break;
          case "LIST":
            words[i] = "Lt";
            break;
          case "LOCAL":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "CURRENCY") {
              words[i] = "LCY";
              words[i + 1] = "";
            }
            break;
          case "LOCATION":
            words[i] = "Loc";
            break;
          case "MAILING":
            words[i] = "Mail";
            break;
          case "MAINTENANCE":
            words[i] = "Maint";
            break;
          case "MANAGEMENT":
            words[i] = "Mgt";
            break;
          case "MANUAL":
            words[i] = "Man";
            break;
          case "MANUFACTURING":
            words[i] = "Mfg";
            break;
          case "MANUFACTURER":
            words[i] = "Mfr";
            break;
          case "MATERIAL":
            words[i] = "Mat";
            break;
          case "MARKETING":
            words[i] = "Mktg";
            break;
          case "MAXIMUM":
            words[i] = "Max";
            break;
          case "MEASURE":
            words[i] = "Meas";
            break;
          case "MESSAGE":
            words[i] = "Msg";
            break;
          case "MINIMUM":
            words[i] = "Min";
            break;
          case "MISCELLANEOUS":
            words[i] = "Misc";
            break;
          case "MODIFY":
            words[i] = "Mod";
            break;
          case "MONTH":
            words[i] = "Mth";
            break;
          case "NEGATIVE":
            words[i] = "Neg";
            break;
          case "NON-INVENTORIABLE":
            words[i] = "NonInvtbl";
            break;
          case "NOTIFICATION":
            words[i] = "Notif";
            break;
          case "NUMBER":
            words[i] = "No";
            break;
          case "NUMBERS":
            words[i] = "Nos";
            break;
          case "OBJECT":
            words[i] = "Obj";
            break;
          case "OPERATING":
            words[i] = "Oper";
            break;
          case "OPPORTUNITY":
            words[i] = "Opp";
            break;
          case "ORDER":
            words[i] = "Ord";
            break;
          case "ORDERS":
            words[i] = "Ords";
            break;
          case "ORIGINAL":
            words[i] = "Orig";
            break;
          case "ORGANIZATION":
            words[i] = "Org";
            break;
          case "OUTBOUND":
            words[i] = "Outbnd";
            break;
          case "OUTGOING":
            words[i] = "Outg";
            break;
          case "OUTPUT":
            words[i] = "Out";
            break;
          case "OUTSTANDING":
            words[i] = "Outstd";
            break;
          case "OVERHEAD":
            words[i] = "Ovhd";
            break;
          case "PAYMENT":
            words[i] = "Pmt";
            break;
          case "PERCENT":
            words[i] = "Pct";
            break;
          case "PERSONNEL":
            words[i] = "Persnl";
            break;
          case "PHYSICAL":
            words[i] = "Phys";
            break;
          case "PICTURE":
            words[i] = "Pic";
            break;
          case "PLANNING":
            words[i] = "Plng";
            break;
          case "POSTED":
            words[i] = "Pstd";
            break;
          case "POSTING":
            words[i] = "Post";
            break;
          case "POSITIVE":
            words[i] = "Pos";
            break;
          case "PRECISION":
            words[i] = "Prec";
            break;
          case "PREPAYMENT":
            words[i] = "Prepmt";
            break;
          case "PRODUCT":
            words[i] = "Prod";
            break;
          case "PRODUCTION":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "ORDER") {
              words[i] = "ProdOrd";
              words[i + 1] = "";
            } else {
              words[i] = "Prod"
            }
            break;
          case "PROJECT":
            words[i] = "Proj";
            break;
          case "PROPERTY":
            words[i] = "Prop";
            break;
          case "PROSPECT":
            words[i] = "Prspct";
            break;
          case "PURCHASE":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "ORDER") {
              words[i] = "PurchOrd";
              words[i + 1] = "";
            }
            words[i] = "Purch";
            break;
          case "PURCHASES":
            words[i] = "Purch";
            break;
          case "PURCHASER":
            words[i] = "Purchr";
            break;
          case "QUALITY":
            words[i] = "Qlty";
            break;
          case "QUANTITY":
            words[i] = "Qty";
            break;
          case "QUESTIONNAIRE":
            words[i] = "Questn";
            break;
          case "QUOTE":
            words[i] = "Qte";
            break;
          case "RADIO":
            if (words[i + 1].toUpperCase() === "FREQUENCY") {
              words[i] = "RF";
              words[i + 1] = "";
            }
            break;
          case "RANGE":
            words[i] = "Rng";
            break;
          case "RECEIPT":
            words[i] = "Rcpt";
            break;
          case "RECEIVED":
            words[i] = "Rcd";
            break;
          case "RECORD":
            words[i] = "Rec";
            break;
          case "RECORDS":
            words[i] = "Recs";
            break;
          case "RECONCILE":
            words[i] = "Recncl";
            break;
          case "RECONCILIATION":
            words[i] = "Recon";
            break;
          case "RECURRING":
            words[i] = "Recur";
            break;
          case "REFERENCE":
            words[i] = "Ref";
            break;
          case "REGISTER":
            words[i] = "Reg";
            break;
          case "REGISTRATION":
            words[i] = "Regn";
            break;
          case "REGISTERED":
            words[i] = "Regd";
            break;
          case "RELATION":
            words[i] = "Rel";
            break;
          case "RELATIONS":
            words[i] = "Rels";
            break;
          case "RELATIONSHIP":
            words[i] = "Rlshp";
            break;
          case "RELEASE":
            words[i] = "Rlse";
            break;
          case "RELEASED":
            words[i] = "Rlsd";
            break;
          case "REMAINING":
            words[i] = "Rem";
            break;
          case "REMINDER":
            words[i] = "Rmdr";
            break;
          case "REPLACEMENT":
            words[i] = "Repl";
            break;
          case "REPLENISH":
            words[i] = "Rplnsh";
            break;
          case "REPLENISHMENT":
            words[i] = "Rplnsht";
            break;
          case "REPORT":
            words[i] = "Rpt";
            break;
          case "REPRESENT":
            words[i] = "Rep";
            break;
          case "REPRESENTED":
            words[i] = "Repd";
            break;
          case "REQUEST":
            words[i] = "Rqst";
            break;
          case "REQUIRED":
            words[i] = "Reqd";
            break;
          case "REQUIREMENT":
            words[i] = "Reqt";
            break;
          case "REQUIREMENTS":
            words[i] = "Reqts";
            break;
          case "REQUISITION":
            words[i] = "Req";
            break;
          case "RESERVE":
            words[i] = "Rsv";
            break;
          case "RESERVED":
            words[i] = "Rsvd";
            break;
          case "RESERVATION":
            words[i] = "Reserv";
            break;
          case "RESOLUTION":
            words[i] = "Resol";
            break;
          case "RESOURCE":
            words[i] = "Res";
            break;
          case "RESPONSE":
            words[i] = "Rsp";
            break;
          case "RESPONSIBILITY":
            words[i] = "Resp";
            break;
          case "RETAIN":
            words[i] = "Rtn";
            break;
          case "RETAINED":
            words[i] = "Rtnd";
            break;
          case "RETURN":
            words[i] = "Ret";
            break;
          case "RETURNS":
            words[i] = "Rets";
            break;
          case "REVALUATION":
            words[i] = "Revaln";
            break;
          case "REVERSE":
            words[i] = "Rev";
            break;
          case "REVIEW":
            words[i] = "Rvw";
            break;
          case "ROUND":
            words[i] = "Rnd";
            break;
          case "ROUNDED":
            words[i] = "Rndd";
            break;
          case "ROUNDING":
            words[i] = "Rndg";
            break;
          case "ROUTE":
            words[i] = "Rte";
            break;
          case "ROUTING":
            words[i] = "Rtng";
            break;
          case "ROUTINE":
            words[i] = "Rout";
            break;
          case "SALES":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "AND" && words[i + 2].toUpperCase() === "RECEIVABLES") {
              words[i] = "Sales";
              words[i + 1] = "";
              words[i + 2] = "";
            }

            break;
          case "SAFETY":
            words[i] = "Saf";
            break;
          case "SCHEDULE":
            words[i] = "Sched";
            break;
          case "SECOND":
            words[i] = "Sec";
            break;
          case "SEGMENT":
            words[i] = "Seg";
            break;
          case "SELECT":
            words[i] = "Sel";
            break;
          case "SELECTION":
            words[i] = "Selctn";
            break;
          case "SEQUENCE":
            words[i] = "Seq";
            break;
          case "SERIAL":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "NUMBER") {
              words[i] = "SN";
              words[i + 1] = "";
            } else {

              words[i] = "Ser";
            }
            break;
          case "SERVICE":
            words[i] = "Serv";
            break;
          case "SHEET":
            words[i] = "Sh";
            break;
          case "SHIPMENT":
            words[i] = "Shpt";
            break;
          case "SOURCE":
            words[i] = "Src";
            break;
          case "SPECIAL":
            words[i] = "Spcl";
            break;
          case "SPECIFICATION":
            words[i] = "Spec";
            break;
          case "SPECIFICATIONS":
            words[i] = "Specs";
            break;
          case "STANDARD":
            words[i] = "Std";
            break;
          case "FREQUENCY":
            words[i] = "SF";
            break;
          case "STATEMENT":
            words[i] = "Stmt";
            break;
          case "STATISTICAL":
            words[i] = "Stat";
            break;
          case "STATISTICS":
            words[i] = "Stats";
            break;
          case "STOCK":
            words[i] = "Stk";
            break;
          case "STOCKKEEPING":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "UNIT") {
              words[i] = "SKU";
              words[i + 1] = "";
            }
            break;
          case "STREAM":
            words[i] = "Stm";
            break;
          case "STRUCTURED":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "QUERY" && words[i + 2].toUpperCase() === "LANGUAGE") {
              words[i] = "SQL";
              words[i + 1] = "";
              words[i + 2] = "";
            }
            break;
          case "SUBCONTRACT":
            words[i] = "Subcontr";
            break;
          case "SUBCONTRACTED":
            words[i] = "Subcontrd";
            break;
          case "SUBCONTRACTING":
            words[i] = "Subcontrg";
            break;
          case "SUBSTITUTE":
            words[i] = "Sub";
            break;
          case "SUBSTITUTION":
            words[i] = "Subst";
            break;
          case "SUGGEST":
            words[i] = "Sug";
            break;
          case "SUGGESTED":
            words[i] = "Sugd";
            break;
          case "SUGGESTION":
            words[i] = "Sugn";
            break;
          case "SUMMARY":
            words[i] = "Sum";
            break;
          case "SUSPENDED":
            words[i] = "Suspd";
            break;
          case "SYMPTOM":
            words[i] = "Sympt";
            break;
          case "SYNCHRONIZE":
            words[i] = "Synch";
            break;
          case "TEMPORARY":
            words[i] = "Temp";
            break;
          case "TOTAL":
            words[i] = "Tot";
            break;
          case "TRANSACTION":
            words[i] = "Transac";
            break;
          case "TRANSFER":
            words[i] = "Trans";
            break;
          case "TRANSLATION":
            words[i] = "Transln";
            break;
          case "TRACKING":
            words[i] = "Trkg";
            break;
          case "TROUBLESHOOT":
            words[i] = "Tblsht";
            break;
          case "TROUBLESHOOTING":
            words[i] = "Tblshtg";
            break;
          case "UNIT":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "OF" && words[i + 2].toUpperCase() === "MEASURE") {
              words[i] = "UoM";
              words[i + 1] = "";
              words[i + 2] = "";
            } else if (words.length - 1 > i && words[i + 1].toUpperCase() === "TEST") {
              words[i] = "UT";
              words[i + 1] = "";
            }
            break;
          case "UNREALIZED":
            words[i] = "Unreal";
            break;
          case "UNRESERVED":
            words[i] = "Unrsvd";
            break;
          case "UPDATE":
            words[i] = "Upd";
            break;
          case "VALUATION":
            words[i] = "Valn";
            break;
          case "VALUE":
            if (words.length - 1 > i + 1 && words[i + 1].toUpperCase() === "ADDED" && words[i + 2].toUpperCase() === "TAX") {
              words[i] = "VAT";
              words[i + 1] = "";
              words[i + 2] = "";
            } else {
              words[i] = "Val";
            }
            break;
          case "VARIANCE":
            words[i] = "Var";
            break;
          case "VENDOR":
            words[i] = "Vend";
            break;
          case "WAREHOUSE":
            words[i] = "Whse";
            break;
          case "WEBSERVICE":
          case "WEB":
            words[i] = "WS";

            if (words.length - 1 > i && words[i + 1].toUpperCase() === "SERVICE") {
              words[i + 1] = "";
            }
            break;
          case "WORKSHEET":
            words[i] = "Wksh";
            break;
          case "G/L":
            words[i] = "GL";
            break;
          case "%":
            words[i] = "Pct";
          case "3-TIER":
            words[i] = "Three-Tier";
            break;
          case "OUTLOOK":
            if (words.length - 1 > i && words[i + 1].toUpperCase() === "SYNCH") {
              words[i] = "Osynch";
              words[i + 1] = "";
            }
            break;
          case "FUNCTION":
          case "FUNCTIONS":
            words[i] = "Func";
            break;

          // New Words
          case "LIBRARY":
            words[i] = "Lib";
            break;
          case "TEXT":
            words[i] = "Txt";
            break;
          case "CONTENT":
            words[i] = "Ctnt";
            break;
          case "MASTER":
            words[i] = "Mr";
            break;
          case "SUBTRACT":
            words[i] = "Subt";
            break;
          case "PERMISSION":
            words[i] = "Perm";
            break;
          case "RANDOM":
            words[i] = "Rnd";
            break;
          case "SUBSCRIBER":
          case "SUBSCRIBE":
            words[i] = "Sub";
            break;
          case "LEASING":
            words[i] = "Lease";
            break;
          case "LOCAL":
            words[i] = "Lcl";
            break;
          case "INITIALIZATION":
            words[i] = "Init";
            break;
          case "MANAGER":
            words[i] = "Mgr";
            break;

        }
      });

      short = words.join("");
      if (tempRec) {
        short = "Tmp" + short;
      }

      short = short.replace(/^(\d|\.)+/gm, "");

      fullDoc.indexOf(short) >= 0 ? (warn = true) : (warn = false);
      CompletionItems.push({
        label: "vShort",
        kind: CompletionItemKind.Text,
        data: { text: short, warning: warn }
      });

      tag = line.replace(/[^A-Z]/g, "");
      if (tempRec) {
        tag = "Tmp" + tag;
      }
      
      tag = tag.replace(/^(\d|\.)+/gm, "");

      fullDoc.indexOf(tag) >= 0 ? (warn = true) : (warn = false);
      CompletionItems.push({
        label: "vTag",
        kind: CompletionItemKind.Text,
        data: { text: tag, warning: warn }
      });
    }
    return CompletionItems;
  }
);

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data.warning) {
    item.detail = "!!" + item.data.text + "!!";
    item.documentation =
      "Insert " +
      item.data.text +
      "\nThere might be an already declared variable with the same name.";
  } else {
    item.detail = item.data.text;
    item.documentation = "Insert " + item.data.text;
  }
  item.insertText = item.data.text;

  return item;
});

interface Settings {
  alVarHelper: alVarHelper;
}

interface alVarHelper {
  ignoreALPrefix: string;
  ignoreALSuffix: string;
}

let ignoreALPrefix: string[];
let ignoreALSuffix: string[];
//alVarHelper.ignoreALPrefix

connection.onDidChangeConfiguration((change) => {
  let settings = <Settings>change.settings;
  ignoreALPrefix = settings.alVarHelper.ignoreALPrefix.split(";") || [];
  ignoreALSuffix = settings.alVarHelper.ignoreALSuffix.split(";") || [];
});

// Listen on the connection
connection.listen();
