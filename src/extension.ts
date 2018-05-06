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
import path = require("path");
import fs =require("fs")
import opn = require("opn")
export function activate(context: vscode.ExtensionContext) {
  const symbolOutlineProvider = new Xb1(context);
}
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';
import cp = require('child_process')
let cmdContainer;
enum NodeType {
  Root = 0,
  Uri,
  CMD,
}
class NodeInfo{
  tooltip?:string;
  label:string;
  type:Number;
  detail:string;
}
class ONode extends NodeInfo{
  pk:string;
  children:ONode[];
  parent:ONode;
}
class SymbolNode {
  parent?: SymbolNode;
  symbol: SymbolInformation;
  children: SymbolNode[];
  info:NodeInfo;
  constructor(symbol?: SymbolInformation) {
    this.children = [];
    this.info = new NodeInfo()
    this.symbol = symbol;
  }
}
class Xb1 {
  symbolViewer: TreeView<SymbolNode>;
  constructor(context: ExtensionContext) {
    const treeDataProvider = new Xb1TreeDataProvider(context);
    const myOutputChannel = window.createOutputChannel("xb1");
    this.symbolViewer = window.createTreeView("xb1", {
      treeDataProvider
    });
    commands.registerCommand("xb1.refresh", () => {
      treeDataProvider.refresh();
    });
    commands.registerCommand("xb1.openUri", (uri:String) => {
      if(uri.length>0)opn(uri);
    });
    commands.registerCommand("xb1.execCMD", (node:SymbolNode) => {
      if(cmdContainer){
        cmdContainer.kill()
      }
      cmdContainer=cp.exec(node.info.detail, { encoding: binaryEncoding }, (err, stdout, stderr) => {
        myOutputChannel.append(iconv.decode(new Buffer(stdout.toString(), binaryEncoding), encoding));
        if (err) {
          myOutputChannel.append('error: ' + iconv.decode(new Buffer(stderr.toString(), binaryEncoding), encoding));
        }
      });
      debugger
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
    let configFile=path.join(workspace.rootPath,"/xb1Extension.js");
    const root= new SymbolNode();
    if(fs.existsSync(configFile)){
      let uri=Uri.file(configFile);
      await commands.executeCommand<SymbolInformation[]>(
        "vscode.open",
        uri
      );
      let symbolNodeArr=await this.getSymbols(uri);
      delete require.cache[configFile]
      let rootM:ONode = require(configFile);
      this.mixNode(null,root,rootM,symbolNodeArr)
    }else{
      const tree = new SymbolNode();
      tree.parent=root;
      tree.info.label="'xb1Extension.js' is not found"
      root.children.push(tree)
    }
    this.tree = root;
  }
  private mixNode(parentNode:SymbolNode,mix:SymbolNode,onode:ONode,symbolNodeArr:SymbolInformation[]):void{
    if(parentNode){
      mix.parent=parentNode
      parentNode.children.push(mix)
    }
    mix.info=onode
    mix.symbol=symbolNodeArr.find(i=>i.name===onode.pk)
    if(onode.children.length>0){
      onode.children.forEach((item)=>{
        let newNode = new SymbolNode()
        this.mixNode(mix,newNode,item,symbolNodeArr)
      })
    }
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
    let treeItem = new TreeItem(node.info.label);
    if (node.children.length) {
      treeItem.collapsibleState =TreeItemCollapsibleState.Expanded
    } else {
      treeItem.collapsibleState = TreeItemCollapsibleState.None;
    }
    if(node.info.type===NodeType.Uri){
      treeItem.command = {
        command: "xb1.openUri",
        title: "打开跳转地址",
        arguments: [node.info.detail]
      };
    }else if(node.info.type==NodeType.CMD){
      treeItem.command = {
        command: "xb1.execCMD",
        title: "打开跳转地址",
        arguments: [node]
      }
    }
    
    treeItem.tooltip =node.info.tooltip;
    treeItem.iconPath = getIcon(1, this.context);
    return treeItem;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}