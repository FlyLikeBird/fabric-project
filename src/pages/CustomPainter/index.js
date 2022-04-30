import React, { useEffect, useState } from 'react';
import { Radio, Button } from 'antd';
import { ToTopOutlined, CopyOutlined, HighlightOutlined, DeleteOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { initGraphAttr, basicGraphs, getBasicAttrs, cloneModel, wrapperEvents } from './util';
import BasicGraphAttrContainer from './BasicGraphAttrContainer';
import SelectionAttrContainer from './SelectionAttrContainer';
import style from './index.css';

let pathObj = null;
let currentIndex = 1;
let canvas = null;
let isPainting = false;

function CustomPainter(){
    let [editing, setEditing] = useState(false);
    let [currentTarget, setCurrentTarget] = useState(null);
    let [attrInfo, setAttrInfo] = useState(initGraphAttr);
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas',{
            backgroundColor:'#fefefe',
            selection:true,
        });
        fabric.Object.prototype.transparentCorners = false;
        document.onmousedown = e =>{
            // 鼠标右键取消自由绘制模式
            if ( e.button === 2 ){
                setEditing(false);
                if ( pathObj ){
                    if ( pathObj.points.length > 2 ){
                        // 至少有两个连接点
                        var temp = new fabric.Polyline(pathObj.points.slice(0, pathObj.points.length-1),{
                            stroke:'#000',
                            strokeWidth:1,
                            fill:'transparent',
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
                let graphObj = basicGraphs.filter(i=>i.key === e.target.getAttribute('data-graph-type'))[0];      
                e.dataTransfer.setData('text/plain', JSON.stringify(graphObj));
            }
        })
        canvas.on('drop',({ e })=>{
            let data = JSON.parse(e.dataTransfer.getData('text/plain'));
            // 按每个字符占位12PX标准计算
            if ( data.type === 'Image') {
                // 模型区
                fabric.Image.fromURL(data.path, oImg=>{
                    let textObj = new fabric.Text(data.title, { top:oImg.height + 10, left:oImg.width/2 - textWidth/2, fontSize:14 });
                    let group = new fabric.Group([oImg, textObj], {
                        dataIndex:data.title, width:oImg.width, height:oImg.height, left:e.offsetX, top:e.offsetY, originX:'center', originY:'center'
                    });     
                    console.log(group);
                    console.log(group.calcTransformMatrix());
                    canvas.add(group);
                })
            } else {
                // 基础图形区,
                let textObj = new fabric.Text(data.title, { fontSize:14 })
                textObj.set({   
                    top:e.offsetY + data.height / 2 + 10,
                    left:e.offsetX - textObj.width / 2
                });
                let graphObj = new fabric[data.type]({
                    ...data.attrs.reduce((sum, cur)=>{
                        sum[cur.attrKey] = cur.attrValue;
                        return sum;
                    },{}),
                    fill:'#cccccc',
                    stroke:'#000000',
                    left:e.offsetX,
                    top:e.offsetY,
                    originX:'center',
                    originY:'center',
                    childNode:textObj
                });
                canvas.add(textObj);
                canvas.add(graphObj);
                wrapperEvents(graphObj);
            } 
        });
        // 监听对象的属性，如有变动更新右侧的属性面板
        canvas.on('object:modified', ({ target })=>{
            setAttrInfo(getBasicAttrs(target));
        })
        canvas.on('selection:created',({ selected })=>{
            let selection = canvas.getActiveObject();
            setCurrentTarget(selection);
        });
      
        canvas.on('mouse:down',function(option){
            let { e, target, pointer } = option;  
            if ( target ){
                setCurrentTarget(target);
                if ( e.altKey ){
                    // 按住ALT键拖动复制选中的对象
                    cloneModel(canvas, target, pointer);
                } else {
                    target.lockMovementX = false;
                    target.lockMovementY = false;
                }
            } else {       
                return ;         
                if ( isPainting ){
                    // 绘制管道
                    
                    canvas.on('mouse:up', option=>{
                        console.log('mouse up');
                    });
                    canvas.on('')
                }
            }            
        })   
    },[]);
    
    return (
        <div>
            <div>
                {/* 操作区 */}
                <div className={style['btn-group']}>
                    <span className={style['btn']}><HighlightOutlined onClick={()=>{ isPainting = true; }}/>自定义路径</span>
                    {/* 基础图形模型 */}
                    {
                        basicGraphs.map((item,i)=>(
                            <span key={i} className={style['btn']} draggable={true} data-graph-type={item.key} style={{ cursor:'grab' }}><CopyOutlined />{ item.title }</span>
                        ))
                    }
                    {/* 外部引入空压机模型 */}
                    <span className={style['btn']} onClick={()=>{
                        if ( currentTarget ){
                            if ( currentTarget.type === 'activeSelection' || currentTarget.type === 'group' ) {
                                currentTarget.forEachObject(obj=>canvas.remove(obj))
                            } else {
                                canvas.remove(currentTarget);
                            }
                            canvas.discardActiveObject();
                            canvas.renderAll();
                        }
                    }}><DeleteOutlined />删除</span>
                </div>
            </div>
            <div className={style['canvas-container']}>
                {/* 绘图区 */}
                <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
                {/* 属性区 */}
                
                {
                    currentTarget && currentTarget.type === 'activeSelection' 
                    ?
                    <SelectionAttrContainer canvas={canvas} currentTarget={currentTarget}  />
                    :
                    currentTarget && currentTarget.type === 'text' 
                    ?
                    <TextAttrContainer />
                    :
                    currentTarget && currentTarget.type !== 'Polyline'
                    ?
                    <BasicGraphAttrContainer canvas={canvas} currentTarget={currentTarget} attrInfo={attrInfo} onChangeAttr={(option)=>setAttrInfo(option)} />
                    :
                    null
                }
                    
            </div>
        </div>
    )
}

export default CustomPainter;