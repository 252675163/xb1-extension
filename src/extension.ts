import * as vscode from "vscode";
import {
  Event,
  EventEmitter,
  ExtensionContext,
  Range,
  Selection,
  SymbolInformation,
  SymbolKind,
  TextDocument,
  TextEditor,
  TextEditorRevealType,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  TreeView,
  commands,
  window,
  workspace,
  Position,
  Uri
} from "vscode";

import { getIcon } from "./icons";
let path = require("path");
export function activate(context: vscode.ExtensionContext) {
  const symbolOutlineProvider = new Xb1(context);
}
class SymbolNode {
  parent?: SymbolNode;
  symbol: SymbolInformation;
  children: SymbolNode[];

  constructor(symbol?: SymbolInformation) {
    this.children = [];
    this.symbol = symbol;
  }
}
class Xb1 {
  symbolViewer: TreeView<SymbolNode>;
  constructor(context: ExtensionContext) {
    const treeDataProvider = new Xb1TreeDataProvider(context);
    this.symbolViewer = window.createTreeView("xb1", {
      treeDataProvider
    });
    commands.registerCommand("xb1.refresh", () => {
      treeDataProvider.refresh();
    });
  }
}
export class Xb1TreeDataProvider
  implements TreeDataProvider<SymbolNode> {
  private _onDidChangeTreeData: EventEmitter<SymbolNode | null> = new EventEmitter<SymbolNode | null>();
  readonly onDidChangeTreeData: Event<SymbolNode | null> = this
    ._onDidChangeTreeData.event;
    
  private context: ExtensionContext;
  private tree: SymbolNode;
  private editor: TextEditor;

  constructor(context: ExtensionContext) {
    this.context = context;
    
  }

  private getSymbols(uri:Uri): Thenable<SymbolInformation[]> {
    return commands.executeCommand<SymbolInformation[]>(
      "vscode.executeDocumentSymbolProvider",
      uri
    );
  }


  private async updateSymbols(editor: TextEditor): Promise<void> {
    let pp=path.join(workspace.rootPath,"/common.js")
    let uri=Uri.file(pp);
    let uu=await this.getSymbols(uri);
    const a= new SymbolNode();
    const tree = new SymbolNode();
    this.editor = editor;
    let c=new SymbolNode()
    tree.children.push(c)
    c.parent=tree;
    tree.parent=a;
    a.children.push(tree)
    this.tree = a;
  }

  async getChildren(node?: SymbolNode): Promise<SymbolNode[]> {
    if (node) {
      return node.children;
    } else {
      await this.updateSymbols(window.activeTextEditor);
      return this.tree ? this.tree.children : [];
    }
  }

  getParent(node: SymbolNode): SymbolNode {
    return node.parent;
  }

  getTreeItem(node: SymbolNode): TreeItem {
    if(!node){
      debugger
    }
    let treeItem = new TreeItem("试试");
    if (node.children.length) {
      treeItem.collapsibleState =TreeItemCollapsibleState.Expanded
    } else {
      treeItem.collapsibleState = TreeItemCollapsibleState.None;
    }
    treeItem.command = {
      command: "xb1.revealRange",
      title: "",
      arguments: [this.editor]
    };

    treeItem.iconPath = getIcon(1, this.context);
    return treeItem;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}