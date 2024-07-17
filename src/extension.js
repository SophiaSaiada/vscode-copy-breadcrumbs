// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";

async function command() {
  const activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    return;
  }

  const documentPath = activeTextEditor.document.uri;
  const activeSelection = activeTextEditor.selection.active;
  const relativePath = vscode.workspace.asRelativePath(documentPath.path);
  const pathWithLine = `${relativePath}:${activeSelection.line + 1}`;

  const n = s(
    await vscode.commands.executeCommand.executeCommand(
      "vscode.executeDocumentSymbolProvider",
      documentPath
    ),
    activeSelection
  ).join(" › ");
  vscode.env.clipboard.writeText(pathWithLine + (n ? ` (${n})` : ""));
}

function s(e, t) {
  const r = e?.find((e) => e.location?.range.contains(t));
  return r ? [r.name, ...s(r.children, t)] : [];
}

module.exports = {
  activate: (context) =>
    subscriptions.push(
      context.commands.registerCommand("dev.sophies.copy-breadcrumbs.copy", command)
    ),
  deactivate: (_) => {},
};
