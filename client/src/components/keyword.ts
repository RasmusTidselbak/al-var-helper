export class KeywordHandler {
  private keywords: string[];

  public casing(doc: string): string {
    let words: string[] = doc.match(/\/\*[\w\W]*?\*\/|\/\/\/.*|\/\/.*|".+?"|'.+?'|[\w\d]+|\S|\s+/g);
    let level: number = 0;
    this.initKeywords();
    words.forEach((word, i) => {
      if (word === "{") {
        level++;
      } else if (word === "}") {
        level--;
      }

      if (level) {
        this.keywords.forEach((keyword) => {
          word = word.toUpperCase() == keyword.toUpperCase() ? keyword : word;
        });
      } else {
        this.objectTypes().forEach((objectType) => {
          word =
            word.toUpperCase() == objectType.toUpperCase() ? objectType : word;
        });
      }
      words[i] = word;
    });

    return words.join("");
  }

  private initKeywords() {
    this.keywords = [
      "BigText",
      "DateTime",
      "Reset",
      "DeleteAll",
      "Clear",
      "Delete",
      "Validate",
      "Blob",
      "Codeunit",
      "DateFormula",
      "Dialog",
      "FieldRef",
      "File",
      "Guid",
      "InStream",
      "OutStream",
      "KeyRef",
      "Page",
      "Record",
      "RecordID",
      "RecordRef",
      "Report",
      "System",
      "TableFilter",
      "BigInteger",
      "Binary",
      "Boolean",
      "Char",
      "Code",
      "Date",
      "DateTime",
      "Decimal",
      "Duration",
      "Integer",
      "Option",
      "Text",
      "Time",
      "Variant",
      "and",
      "AssertError",
      "begin",
      "case",
      "div",
      "do",
      "DownTo",
      "else",
      "end",
      "exit",
      "for",
      "if",
      "in",
      "mod",
      "not",
      "of",
      "or",
      "repeat",
      "then",
      "to",
      "until",
      "while",
      "with",
      "with",
      "var",
      "procedure",
      "temporary",
      "true",
      "false",
      "XmlPort",
      "TextConst",
      "Error",
      "Message",
      "FindSet",
      "FindFirst",
      "FindLast",
      "Find",
      "Next",
      "CalcFields",
      "HasValue",
      "SetRange",
      "SetFilter",
      "Format",
      "RunModal",
      "Run",
      "Action",
      "SetTableView",
      "Update",
      "Insert",
      "Modify",
      "Get",
      "Where",
      "field",
      "SetRecord",
      "GetRecord",
      "LookupMode",
      "UserId",
      "const",
      "filter",
      "LowerCase",
      "StrSubStNo"
    ];
  }

  private objectTypes(): string[] {
    return [
      "codeunit",
      "record",
      "page",
      "pagecustomization",
      "pageextension",
      "extends",
      "tableextension",
      "table",
      "xmlport",
      "query",
      "report"
    ];
  }
  public static keywordExists(keyword: string, words: any): boolean {
    if (!(words instanceof Array)) {
      words = this.keywordSplit(words);
    }
    if (words) {
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (word.toUpperCase() == "//") {
          return false;
        } else if (word.toUpperCase() == keyword.toUpperCase()) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * keywordSplit
   */
  public static keywordSplit(line: string): string[] {
    return line.match(/\/\*|\*\/|\/\/|".+?"|'.+?'|[\w\d]+|\S/g);
  }
}
