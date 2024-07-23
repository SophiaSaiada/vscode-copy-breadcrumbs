import type {
  DocumentSymbol,
  ExtensionContext,
  Position,
  SymbolInformation,
  Uri,
} from "vscode";
import { commands, env, window, workspace } from "vscode";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("dev.sophies.copy-breadcrumbs.copy", command)
  );
}

export function deactivate() {}

async function command() {
  const activeTextEditor = window.activeTextEditor;
  if (!activeTextEditor) {
    return;
  }

  const documentPath = activeTextEditor.document.uri;
  const activeSelection = activeTextEditor.selection.active;
  const relativePath = workspace.asRelativePath(documentPath.path);
  const pathWithLine = `${relativePath}:${activeSelection.line + 1}`;

  const breadcrumbs = await getBreadcrumbs(documentPath, activeSelection);

  const textToCopy = pathWithLine + (breadcrumbs ? ` (${breadcrumbs})` : "");
  env.clipboard.writeText(textToCopy);
}

const getBreadcrumbs = async (documentPath: Uri, activeSelection: Position) => {
  const allSymbols: (SymbolInformation | DocumentSymbol)[] =
    await commands.executeCommand(
      "vscode.executeDocumentSymbolProvider",
      documentPath
    );

  return getRelevantSymbolsNamesPath(allSymbols, activeSelection).join(" › ");
};

const getRelevantSymbolsNamesPath = (
  symbols: (SymbolInformation | DocumentSymbol)[],
  activeSelection: Position
): string[] => {
  const relevantSymbol = symbols?.find((symbol) =>
    "location" in symbol
      ? symbol.location?.range.contains(activeSelection)
      : symbol.selectionRange.contains(activeSelection)
  );

  if (!relevantSymbol) {
    return [];
  }

  const childrenPath =
    "children" in relevantSymbol
      ? getRelevantSymbolsNamesPath(relevantSymbol.children, activeSelection)
      : [];

  return [relevantSymbol.name, ...childrenPath];
};

module.exports = {
  activate,
  deactivate,
};
