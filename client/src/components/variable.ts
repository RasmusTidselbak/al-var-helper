import { KeywordHandler } from "./keyword";
export class VariableHandler {
  private lines: string[];
  /**
     * sort
     */
  public sort(doc: string): string {
    this.lines = doc.split(/\r?\n/g);
    let varIndex: number = 0;
    let varArray: string[];
    let searching: boolean = false;
    this.lines.forEach((line, i) => {
      // Store first index id
      if (line.trim() === "var") {
        varIndex = i;
        varArray = [];
        searching = true;
      } else if (searching) {
        // Export all variables
        if (
          !(
            KeywordHandler.keywordExists("procedure", line) ||
            KeywordHandler.keywordExists("begin", line) ||
            KeywordHandler.keywordExists("}", line) ||
            KeywordHandler.keywordExists("trigger", line) ||
            KeywordHandler.keywordExists("BusinessEvent", line) ||
            KeywordHandler.keywordExists("IntegrationEvent", line) ||
            KeywordHandler.keywordExists("EventSubscriber", line) ||
            line.toUpperCase().indexOf("[TEST]") > 0 ||
            line.toUpperCase().indexOf("[HANDLERFUNCTIONS") > 0 ||
            line.toUpperCase().indexOf("[MESSAGEHANDLER]") > 0
          )
        ) {
          if (line.replace(/\s/g, "").length) {
            if (!KeywordHandler.keywordExists(";", line)) {
              let j: number = i;
              let leadingSpaces: number = 0;
              while (!KeywordHandler.keywordExists(";", line)) {

                // if TextConst exists
                if (KeywordHandler.keywordExists("TextConst", line)) {
                  leadingSpaces = line.toLowerCase().indexOf("textconst");
                  leadingSpaces += 10;
                }
                // Find TextConst on line and use this as the leading number of spaces
                j++;
                line += `\n${" ".repeat(leadingSpaces)}${this.lines[j].trim()}`;
                this.lines[j] = "";
              }
            }
            varArray.push(line);
          }
        } else {
          searching = false;
          if (varArray.length >= 1) {
            varArray = varArray.sort((a, b) => {
              let aWeight = this.varTypeWeight(a);
              let bWeight = this.varTypeWeight(b);

              if (aWeight === bWeight) {
                return a.toUpperCase() < b.toUpperCase() ? -1 : 1;
              }

              return bWeight - aWeight;
            });

            for (let j = varIndex + 1; j < i; j) {
              let varLine: string = varArray.shift();
              if (varLine) {
                varLine = varLine.replace(/\s*:\s*/, ": ");
              }

              if (varLine) {
                let newLines: string[] = varLine.match(/[^\n]*/g);
                newLines.forEach(newLine => {
                  if (newLine) {
                    this.lines[j++] = newLine;
                  }
                });
                // this.lines[j] = varLine;
              } else {
                this.lines[j++] = "";
              }
            }
          }
        }
      }
    });
    return this.lines.join("\n");
  }

  private varTypeWeight(varLine: string): number {
    switch (true) {
      case KeywordHandler.keywordExists("Record", varLine):
        return 1500;
      case KeywordHandler.keywordExists("Page", varLine):
        return 1490;
      case KeywordHandler.keywordExists("Report", varLine):
        return 1480;
      case KeywordHandler.keywordExists("XmlPort", varLine):
        return 1470;
      case KeywordHandler.keywordExists("Codeunit", varLine):
        return 1460;
      case KeywordHandler.keywordExists("Query", varLine):
        return 1459;
      case KeywordHandler.keywordExists("Notification", varLine):
        return 1455;
      case KeywordHandler.keywordExists("Blob", varLine):
        return 1450;
      case KeywordHandler.keywordExists("Dialog", varLine):
        return 1440;
      case KeywordHandler.keywordExists("File", varLine):
        return 1430;
      case KeywordHandler.keywordExists("HttpClient", varLine):
        return 449;
      case KeywordHandler.keywordExists("HttpContent", varLine):
        return 449;
      case KeywordHandler.keywordExists("HttpHeaders", varLine):
        return 448;
      case KeywordHandler.keywordExists("HttpResponseMessage", varLine):
        return 447;
      case KeywordHandler.keywordExists("HttpRequestMessage", varLine):
        return 447;
      case KeywordHandler.keywordExists("JsonObject", varLine):
        return 429;
      case KeywordHandler.keywordExists("JsonValue", varLine):
        return 428;
      case KeywordHandler.keywordExists("JsonArray", varLine):
        return 427;
      case KeywordHandler.keywordExists("JsonToken", varLine):
        return 426;
      case KeywordHandler.keywordExists("XmlElement", varLine):
        return 405;
      case KeywordHandler.keywordExists("XmlDocument", varLine):
        return 404;
      case KeywordHandler.keywordExists("XmlAttribute", varLine):
        return 403;
      case KeywordHandler.keywordExists("HttpClient", varLine):
        return 302;
      case KeywordHandler.keywordExists("JsonToken", varLine):
        return 301;
      case KeywordHandler.keywordExists("DateFormula", varLine):
        return 300;
      case KeywordHandler.keywordExists("FieldRef", varLine):
        return 280;
      case KeywordHandler.keywordExists("Guid", varLine):
        return 250;
      case KeywordHandler.keywordExists("RecordRef", varLine):
        return 245;
      case KeywordHandler.keywordExists("InStream", varLine):
        return 240;
      case KeywordHandler.keywordExists("OutStream", varLine):
        return 230;
      case KeywordHandler.keywordExists("KeyRef", varLine):
        return 220;
      case KeywordHandler.keywordExists("BigText", varLine):
        return 210;
      case KeywordHandler.keywordExists("RecordID", varLine):
        return 200;
      case KeywordHandler.keywordExists("System", varLine):
        return 180;
      case KeywordHandler.keywordExists("TableFilter", varLine):
        return 170;
      case KeywordHandler.keywordExists("BigInteger", varLine):
        return 160;
      case KeywordHandler.keywordExists("Binary", varLine):
        return 150;
      case KeywordHandler.keywordExists("Boolean", varLine):
        return 140;
      case KeywordHandler.keywordExists("Char", varLine):
        return 130;
      case KeywordHandler.keywordExists("Code", varLine):
        return 120;
      case KeywordHandler.keywordExists("Date", varLine):
        return 110;
      case KeywordHandler.keywordExists("DateTime", varLine):
        return 100;
      case KeywordHandler.keywordExists("Decimal", varLine):
        return 90;
      case KeywordHandler.keywordExists("Duration", varLine):
        return 80;
      case KeywordHandler.keywordExists("Integer", varLine):
        return 70;
      case KeywordHandler.keywordExists("Enum", varLine):
        return 61;
      case KeywordHandler.keywordExists("Option", varLine):
        return 60;
      case KeywordHandler.keywordExists("Text", varLine):
        return 50;
      case KeywordHandler.keywordExists("Time", varLine):
        return 40;
      case KeywordHandler.keywordExists("Variant", varLine):
        return 30;
      case KeywordHandler.keywordExists("TextConst", varLine):
        return 20;
      case KeywordHandler.keywordExists("Label", varLine):
        return 19;
    }
    return 1;
  }
}
