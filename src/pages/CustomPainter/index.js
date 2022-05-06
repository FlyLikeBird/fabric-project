import React, { useEffect, useState } from 'react';
import { Radio, Button } from 'antd';
import { ToTopOutlined, CopyOutlined, HighlightOutlined, DeleteOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { initGraphAttr, basicGraphs, getBasicAttrs, cloneModel, wrapperEvents, connectModels, delTarget } from './util';
import BasicGraphAttrContainer from './BasicGraphAttrContainer';
import SelectionAttrContainer from './SelectionAttrContainer';
import PipeAttrContainer from './PipeAttrContainer';
import style from './index.css';

let canvas = null;
let objId = 1;

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
        document.addEventListener('dragstart',e=>{
            if ( e.target.className === style['btn'] ) {
                let graphObj = basicGraphs.filter(i=>i.key === e.target.getAttribute('data-graph-type'))[0];      
                e.dataTransfer.setData('text/plain', JSON.stringify(graphObj));
            }
        })
        canvas.on('drop',({ e })=>{
            let data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if ( data.type === 'Image') {
                // 模型区
                fabric.Image.fromURL(data.path, oImg=>{
                    let id = ++objId;
                    let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14 } );
                    textObj.set({
                        top:e.offsetY + oImg.height / 2 + 10,
                        left:e.offsetX - textObj.width / 2,
                        selectable:false
                    });
                    oImg.lockRotation = true;
                    oImg.set({
                        left:e.offsetX,
                        top:e.offsetY,
                        originX:'center',
                        originY:'center',
                        childNode:textObj,
                        objId:id
                    });
                    canvas.add(textObj);
                    canvas.add(oImg);
                    wrapperEvents(oImg);
                })
            } else {
                // 基础图形区,
                let id = ++objId;
                let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14 })
                textObj.set({   
                    top:e.offsetY + data.height / 2 + 10,
                    left:e.offsetX - textObj.width / 2,
                    selectable:false
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
                    objId:id,
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
            if ( target.flowArr ) {
                target.flowArr.forEach(obj=>{
                    connectModels(canvas, obj.start, obj.end, obj.direc);
                })
            }
        })
        canvas.on('selection:created',({ selected })=>{
            let selection = canvas.getActiveObject();
            setCurrentTarget(selection);
        });       
        canvas.on('mouse:down',function(option){
            let { e, target, pointer } = option;  
            if ( target ){
                setCurrentTarget(target);
                // if ( e.altKey ){
                //     // 按住ALT键拖动复制选中的对象
                //     cloneModel(canvas, target, pointer);
                // } else {
                    
                // }
            }         
        });
        return ()=>{
            objId = 1;
        }  
    },[]);
    return (
        <div>
            <div>
                {/* 操作区 */}
                <div className={style['btn-group']}>
                    {/* 基础图形模型 */}
                    {
                        basicGraphs.map((item,i)=>(
                            <span key={i} className={style['btn']} draggable={true} data-graph-type={item.key} style={{ cursor:'grab' }}><CopyOutlined />{ item.title }</span>
                        ))
                    }
                    {/* 外部引入空压机模型 */}
                    <span className={style['btn']} onClick={()=>{
                        delTarget(canvas, currentTarget);
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
                    currentTarget && currentTarget.type === 'polyline' 
                    ?
                    <PipeAttrContainer canvas={canvas} currentTarget={currentTarget} />
                    :
                    currentTarget
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