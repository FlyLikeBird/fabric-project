import React, { useEffect, useState } from 'react';
import { Radio, Button } from 'antd';
import { ToTopOutlined, CopyOutlined, HighlightOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import Img from '../../public/wxApp.jpg';
import style from './index.less';

let isEditing = false;
let isDraging = false;
let pathObj = null;
let currentIndex = 1;
let currentTarget = null;
let canvas = null;

let basicGraphs = [
    { type:'Rect', title:'矩形', info:{ width:200, height:150 } },
    { type:'Circle', title:'圆形', info:{ radius:50 } },
    { type:'Ellipse', title:'椭圆形', info:{ rx:200, ry:100 } },
    { type:'Triangle', title:'三角形', info:{ width:200, height:150 }}
];

function Container(){
    let [editing, setEditing] = useState(false);
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas',{
            backgroundColor:'#fefefe',
            selection:true,
        });
        document.onmousedown = e =>{
            // 鼠标右键取消自由绘制模式
            if ( e.button === 2 ){
                isEditing = false;
                if ( pathObj ){
                    if ( pathObj.points.length > 2 ){
                        // 至少有两个连接点
                        var temp = new fabric.Polyline(pathObj.points.slice(0, pathObj.points.length-1),{
                            stroke:'#000',
                            strokeWidth:1,
                            fill:'transparent',
                            objectCaching:false
                        });
                        console.log(temp);
                        console.log(temp.calcTransformMatrix());
                        canvas.add(temp);
                    }    
                }
                canvas.remove(pathObj);
                pathObj = null;
                currentIndex = 1;
                if ( canvas ){ 
                    canvas.off('mouse:move');
                }
            }
        }
        document.addEventListener('dragstart',e=>{
            if ( e.target.className === style['btn'] ) {
                let graphObj = basicGraphs.filter(i=>i.type === e.target.getAttribute('data-graph-type'))[0];      
                e.dataTransfer.setData('text/plain', JSON.stringify(graphObj));
            }
        })
        // 监听拖拽事件
        
        // document.addEventListener('dragover', e=>{
        //     e.preventDefault();
        // });
        // document.addEventListener('drop',e=>{
        //     console.log(e.target);
        //     e.preventDefault();
        //     if ( e.target.nodeName === 'CANVAS' ) {
        //         let data = JSON.parse(e.dataTransfer.getData('text/plain'));
        //         if ( canvas ){
        //             canvas.add(new fabric[data.type]({
        //                 ...data.info,
        //                 left:e.clientX,
        //                 top:e.clientY,
        //                 fill:'#ccc'
        //             }));
        //         }
        //     }

        //     console.log(e.dataTransfer.getData('text/plain'));
        //     console.log('drop');
        // });
        canvas.on('drop',({ e })=>{
            console.log(e);
            let data = JSON.parse(e.dataTransfer.getData('text/plain'));
            canvas.add(new fabric[data.type]({
                ...data.info,
                left:e.offsetX,
                top:e.offsetY,
                originX:'center',
                originY:'center',
                fill:'#ccc'
            }))
        })
        canvas.on('mouse:down',function(option){
            console.log(option);
            let { target } = option;
            if ( target ){
                // 切换对象的属性面板
                currentTarget = target;
                if ( target.type === 'polyline') {
                    
                } else {
                    
                }
            } else {
                currentTarget = null;
                setEditing(false);
                if ( isEditing ){
                    // 绘制管道
                    let { pointer:{ x, y } } = option;
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
                    canvas.on('mouse:up', option=>{
                        console.log('mouse up');
                    });
                    canvas.on('')
                }
            }            
        })
       
    },[]);
    function handlePosition(dim, finalMatrix, fabricObject){
        let objX = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x;
        let objY = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
        let result = fabric.util.transformPoint(
            { x:objX, y:objY },
            fabric.util.multiplyTransformMatrices(
                fabricObject.canvas.viewportTransform,
                fabricObject.calcTransformMatrix()
            )
        )
        return result;
    }
    function handleAction(evt, transform, x, y){
        console.log(transform);
        let target = transform.target;
        // 视窗坐标系下拖动点和图形对象中心点的距离
        let center = target.getCenterPoint();
        let currentControl = target.controls[target.__corner];
        let absoluteX = x - center.x ;
        let absoluteY = y - center.y;
        // 图形坐标系下拖动点和图形对象中心点距离
        let mouseLocalPosition = target.toLocalPoint(new fabric.Point(x, y), 'center', 'center')
        console.log('-----');
        console.log(mouseLocalPosition);
        let finalPoint = {
            x:absoluteX + target.pathOffset.x,
            y:absoluteY + target.pathOffset.y
        };
        return true;
    }
    
    return (
        <div>
            <div>
                {/* 操作区 */}
                <div className={style['btn-group']}>
                    <span className={style['btn']}><HighlightOutlined onClick={()=>{ isEditing = true }}/></span>
                    {
                        basicGraphs.map((item,i)=>(
                            <span key={i} className={style['btn']} draggable={true} data-graph-type={item.type}><CopyOutlined /></span>
                        ))
                    }
                </div>
            </div>
            <div style={{ display:'flex' }}>
                {/* 绘图区 */}
                <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
                {/* 属性区 */}
                <div className='attr-container'>
                    <div>
                        <Button type='primary' onClick={()=>{
                            setEditing(!editing);
                            if ( currentTarget ){
                                currentTarget.hasBorders = !editing ? false : true;
                                currentTarget.transparentCorners = false;
                                if ( !editing ){
                                    currentTarget.cornerStyle = 'circle';
                                    currentTarget.cornerColor = 'rgba(0,0,255,0.5)';
                                    currentTarget.controls = currentTarget.points.reduce(function(acc, point, index) {
                                        acc['p' + index] = new fabric.Control({
                                            positionHandler:handlePosition,
                                            actionHandler:handleAction,
                                            actionName: 'modifyPolygon',
                                            pointIndex: index
                                        });
                                        return acc;
                                    }, { });
                                } else {
                                    // currentTarget
                                    currentTarget.cornerColor = 'blue';
                                    currentTarget.cornerStyle = 'rect';
                                    console.log(currentTarget.getBoundingRect(currentTarget.points, true));
                                    let center = currentTarget.getCenterPoint();
                                    // currentTarget.points.forEach(point=>{
                                    //     let x = point.x - center.x, y = point.y - center.y;
                                       
                                    //     console.log(fabric.util.transformPoint({ x, y }, currentTarget.calcTransformMatrix()))
                                    // })
                                    currentTarget.controls = fabric.Object.prototype.controls;
                                }
                                console.log(currentTarget);
                                canvas.renderAll();
                                
                            }
                        }}>{ editing ? '取消编辑' : '编辑' }</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Container;