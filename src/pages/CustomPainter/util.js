import img1 from '../../../public/1.png';
import img2 from '../../../public/2.png';
import img3 from '../../../public/3.png';
import img4 from '../../../public/4.png';

let machList = [
    { key:'mach1', type:'Image', title:'空压机1', path:img1, attrs:[] },
    { key:'mach2', type:'Image', title:'空压机2', path:img2, attrs:[] },
    { key:'mach3', type:'Image', title:'空压机3', path:img3, attrs:[] },
    { key:'mach4', type:'Image', title:'空压机4', path:img4, attrs:[] },
];

export let initGraphAttr = { text:'', fontSize:14, fontColor:'#000000', width:0, height:0, radius:0, rx:0, ry:0, scaleX:1, scaleY:1, angle:0, fill:'#cccccc', stroke:'#000000', strokeWidth:1 }
export let basicGraphs = [
    // width,height 描述边界框的范围
    { key:'Rect', type:'Rect', title:'矩形', width:200, height:150, attrs:[{ attrKey:'width', attrName:'宽度', attrValue:200 }, { attrKey:'height', attrName:'高度', attrValue:150 }]},
    { key:'Circle', type:'Circle', title:'圆形', width:100, height:100, attrs:[{ attrKey:'radius', attrName:'半径', attrValue:50 }] },
    { key:'Ellipse', type:'Ellipse', title:'椭圆形', width:240, height:160, attrs:[{ attrKey:'rx', attrName:'横向轴', attrValue:120}, { attrKey:'ry', attrName:'纵向轴', attrValue:80 }]},
    { key:'Triangle', type:'Triangle', title:'三角形', width:200, height:150, attrs:[{ attrKey:'width', attrName:'宽度', attrValue:200 }, { attrKey:'height', attrName:'高度', attrValue:150 }]},
    ...machList
];

let pathObj = null;
let currentIndex = 1;

export function wrapperEvents(obj){
    function handleTransform({ e, pointer, transform }){
        let { target } = transform;
        let boundingRect = target.getBoundingRect();
        if ( target.childNode ){
            target.childNode.set({
                left:boundingRect.left + boundingRect.width/2 - target.childNode.width/2,
                top:boundingRect.top + boundingRect.height + 10 
            })
        }
    }
    obj.on('moving', handleTransform);
    obj.on('scaling', handleTransform);
    obj.on('rotating', handleTransform);
}
export function createPath({ canvas, pointer }){
    if ( !pathObj ){
        // pathObj临时存储鼠标绘制的points, 等所有点都绘制完毕最后再生成Polyline对象                     
        pathObj = new fabric.Polyline([{ x, y }],{
            stroke:'#000',
            strokeWidth:1,
            fill:'transparent',
            objectCaching:false
        });
        canvas.add(pathObj);
    } else {
        // Polyline添加新的定位点
        currentIndex++; 
    }
    canvas.on('mouse:move', option=>{
        let { e, pointer:{ x, y }} = option;
        // console.log(option);
        if ( pathObj ){
            let temp = [...pathObj.points];
            let lastPointPos = temp[currentIndex-1];
            // console.log(lastPointPos);
            let k = ( lastPointPos.y - y ) / (x - lastPointPos.x);
            if ( e.shiftKey ){                          
                // console.log(k);
                // console.log(x,y);
                // 任意角度绘制连接线，当按住Shift键时，只能绘制0,45,90度的连接线
                if ( Math.abs((Math.abs(k) - Math.tan(Math.PI/4))) <= 0.3 ) {
                    let offsetY = Math.abs(( x - lastPointPos.x )) * Math.tan(Math.PI/4);
                    let newY = y <= lastPointPos.y ? lastPointPos.y - offsetY : lastPointPos.y + offsetY; 
                    temp[currentIndex] = { x, y: newY };
                } else if ( Math.abs(k) < Math.tan(Math.PI/4)) {
                    temp[currentIndex] = { x, y:lastPointPos.y };
                } else {                      
                    temp[currentIndex] = { x:lastPointPos.x, y };
                } 
            } else {                        
                temp[currentIndex] = { x, y };
            }
            pathObj.set({
                points:temp
            });
            canvas.renderAll();
        }
    });
}
// export function createPath({ canvas, pointer }){
//     if ( !pathObj ){
//         // pathObj临时存储鼠标绘制的points, 等所有点都绘制完毕最后再生成Polyline对象                     
//         pathObj = new fabric.Polyline([{ x, y }],{
//             stroke:'#000',
//             strokeWidth:1,
//             fill:'transparent',
//             objectCaching:false
//         });
//         canvas.add(pathObj);
//     } else {
//         // Polyline添加新的定位点
//         currentIndex++; 
//     }
//     canvas.on('mouse:move', option=>{
//         let { e, pointer:{ x, y }} = option;
//         // console.log(option);
//         if ( pathObj ){
//             let temp = [...pathObj.points];
//             let lastPointPos = temp[currentIndex-1];
//             // console.log(lastPointPos);
//             let k = ( lastPointPos.y - y ) / (x - lastPointPos.x);
//             if ( e.shiftKey ){                          
//                 // console.log(k);
//                 // console.log(x,y);
//                 // 任意角度绘制连接线，当按住Shift键时，只能绘制0,45,90度的连接线
//                 if ( Math.abs((Math.abs(k) - Math.tan(Math.PI/4))) <= 0.3 ) {
//                     let offsetY = Math.abs(( x - lastPointPos.x )) * Math.tan(Math.PI/4);
//                     let newY = y <= lastPointPos.y ? lastPointPos.y - offsetY : lastPointPos.y + offsetY; 
//                     temp[currentIndex] = { x, y: newY };
//                 } else if ( Math.abs(k) < Math.tan(Math.PI/4)) {
//                     temp[currentIndex] = { x, y:lastPointPos.y };
//                 } else {                      
//                     temp[currentIndex] = { x:lastPointPos.x, y };
//                 } 
//             } else {                        
//                 temp[currentIndex] = { x, y };
//             }
//             pathObj.set({
//                 points:temp
//             });
//             canvas.renderAll();
//         }
//     });
// }
// function handlePosition(dim, finalMatrix, fabricObject){
//     let objX = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x;
//     let objY = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
//     let result = fabric.util.transformPoint(
//         { x:objX, y:objY },
//         fabric.util.multiplyTransformMatrices(
//             fabricObject.canvas.viewportTransform,
//             fabricObject.calcTransformMatrix()
//         )
//     )
//     return result;
// }
// function handleAction(evt, transform, x, y){
//     console.log(transform);
//     let target = transform.target;
//     // 视窗坐标系下拖动点和图形对象中心点的距离
//     let center = target.getCenterPoint();
//     let currentControl = target.controls[target.__corner];
//     let absoluteX = x - center.x ;
//     let absoluteY = y - center.y;
//     // 图形坐标系下拖动点和图形对象中心点距离
//     let mouseLocalPosition = target.toLocalPoint(new fabric.Point(x, y), 'center', 'center')
//     console.log('-----');
//     console.log(mouseLocalPosition);
//     let finalPoint = {
//         x:absoluteX + target.pathOffset.x,
//         y:absoluteY + target.pathOffset.y
//     };
//     return true;
// }
// 复制图形对象
let activeObj = null;

export function cloneModel(canvas, target, pointer){
    // canvas.discardActiveObject();
    target.lockMovementX = true;
    target.lockMovementY = true;    
    if ( target.type === 'activeSelection' ) {
        // clone方法是异步过程，后续操作必须放在回调函数
        let allPromise = [];
        target.forEachObject(obj=>{
            allPromise.push(new Promise((resolve, reject)=>{
                obj.clone((clonedObj)=>{
                    canvas.add(clonedObj);
                    resolve(clonedObj);
                });
            }))          
        });
        Promise.all(allPromise).then(([...children])=>{
            activeObj = new fabric.ActiveSelection(children, { left:target.left, top:target.top });
            activeObj.canvas = canvas;     
            activeObj.opacity = 0.5;         
            activeObj.initLeft = activeObj.left;
            activeObj.initTop = activeObj.top;
            canvas.setActiveObject(activeObj);
        })  
    } else {
        target.clone((clonedObj)=>{
            activeObj = clonedObj;
            activeObj.opacity = 0.5;
            activeObj.initLeft = activeObj.left;
            activeObj.initTop = activeObj.top;
            canvas.add(activeObj);
            canvas.setActiveObject(activeObj);
        });
    };
    function handleMouseMove({ e }){
        if ( activeObj ){
            let offsetX = e.offsetX - pointer.x;
            let offsetY = e.offsetY - pointer.y;
            activeObj.set({
                left:activeObj.initLeft + offsetX,
                top:activeObj.initTop + offsetY,
            });
            canvas.renderAll(); 
        }
    }
    function handleMouseUp(e){
        if ( activeObj ){
            activeObj.opacity = 1;
            canvas.renderAll();
        }
        activeObj = null;
        canvas.off('mouse:move', handleMouseMove);
        canvas.off('mouse:up', handleMouseUp);
    }
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
} 
// 更新图形对象的某项属性
export function updateTargetAttr(canvas, target, attrName, value){
    if ( target ){
        if ( attrName === 'angle' ) {
            group.set({ [attrName]:value });
        } else if ( attrName === 'scaleX' || attrName === 'scaleY' ) {
            group.set({ [attrName]:value });
            canvas.renderAll();
            // 当整组缩放时，调整文字对象的缩放以保持不变
            let newBounding = group.getBoundingRect();
            let centerPoint = group.getCenterPoint();
            console.log(centerPoint);
            console.log(newBounding);
            textObj.set({ [attrName]:1/value, left:-textObj.width/2 });
            console.log(group);
        } else {
            target.set({
                [attrName]:value
            });
        }
        canvas.renderAll();
    }
}

export function getBasicAttrs(target){
    let textObj = target.childNode;
    let width = target.get('width');
    let height = target.get('height');
    let text = textObj.get('text');
    let fontSize = textObj.get('fontSize');
    let fontColor = textObj.get('fill');
    let radius = target.get('radius');
    let rx = target.get('rx');
    let ry = target.get('ry');
    let scaleX = group.get('scaleX');
    let scaleY = group.get('scaleY');
    let angle = group.get('angle');
    let fill = target.get('fill');
    let stroke = target.get('stroke');
    let strokeWidth = target.get('strokeWidth');
    return { width, height, text, fontSize, fontColor, radius:Math.round(radius), rx:Math.round(rx), ry:Math.round(ry), scaleX:scaleX.toFixed(1), scaleY:scaleY.toFixed(1), angle:angle.toFixed(1), fill, stroke, strokeWidth };
}
