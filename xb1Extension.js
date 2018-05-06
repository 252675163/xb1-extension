class Node{
    constructor(pk,label,type, detail,tooltip,parent) {
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
let root=new Node("root","",0,"","",null)
let docsNode=new Node("docsNode","查阅的文档",0,"","可以翻看项目中所需要用到的文档",root) 
let docs1 =new Node("docs1","moment文档",1,"https://www.tslang.cn/docs/handbook/classes.html","moment文档2",docsNode) 
// {
//     [
//         {
//             label:"查阅的文档",
//             title:"可以翻看项目中所需要用到的文档",
//             type:0,
//             detail:"",
//             children:[
//                 {
//                     label:"moment文档",
//                     title:"",
//                     type:1,
//                     detail:"https://www.tslang.cn/docs/handbook/classes.html"
//                 }
//             ]
//         }
//     ]
// }
module.exports=root