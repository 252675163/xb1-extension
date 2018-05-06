class Node{
    constructor({pk,label,type, detail,tooltip,parent}) {
    this.pk=pk
    this.label = label;
    this.type = type;
    this.detail = detail;
    this.tooltip = tooltip;
    this.children = [];
    if(parent){
        parent.children.push(this)
    }
  }
}
let root=new Node({
    pk:"root",
    label:"",
    type:0,
    detail:"",
    tooltip:"",
    parent:null
})
let docsNode=new Node({
    pk:"docsNode",label:"查阅的文档",type:0,detail:"",tooltip:"可以翻看项目中所需要用到的文档",parent:root
}) 
let docs1 =new Node({
    pk:"docs1",label:"moment文档",type:1,detail:"https://www.tslang.cn/docs/handbook/classes.html",tooltip:"moment文档2",parent:docsNode
}) 
let packageJsonCMD= new Node({
    pk:"packageJsonCMD",label:"package.json中的命令",type:0,detail:"",tooltip:"可以一览package.json中的命令",parent:root
}) 
let CMD1=new Node({
    pk:"CMD1",label:"test",type:2,detail:"msbuild",tooltip:"测试啊",parent:packageJsonCMD
}) 
module.exports=root