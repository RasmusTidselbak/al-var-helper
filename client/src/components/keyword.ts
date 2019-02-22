export class KeywordHandler {
  private keywords: string[];
  private functionKeywords: string[];

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
          if (word.toUpperCase() == keyword.toUpperCase()) {
            word = keyword;
            if (this.functionKeywords.includes(word) && words[i+1] !== "(") {
              word += "()";
            }
          }

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
      "Confirm",
      "Count",
      "TestField",
      "BigText",
      "DateTime",
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
      "CalcFields",
      "SetRange",
      "SetFilter",
      "Format",
      "RunModal",
      "Run",
      "Action",
      "SetTableView",
      "Where",
      "field",
      "SetRecord",
      "GetRecord",
      "LookupMode",
      "const",
      "filter",
      "LowerCase",
      "StrSubStNo",
      "TextEncoding",
      "Enum",
      "Label"
    ];
    
    this.functionKeywords = [
      "Commit",
      "GuiAllowed",
      "FindSet",      
      "FindFirst",
      "FindLast",
      "Find",
      "IsEmpty",
      "Reset",
      "DeleteAll",
      "Clear",
      "UserId",
      "Update",
      "Insert",
      "Modify",
      "HasValue",
      "Next",
      "Delete",
      "Init",
      "Get",
      "Count",
      "Skip",
      "GetFilters",
      "UseRequestPage",
      "Preview",
      "TableCaption"
    ];

    this.keywords = this.keywords.concat(this.functionKeywords);
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
      "report",
      "FieldCaption"
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
