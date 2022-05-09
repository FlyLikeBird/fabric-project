import React, { useEffect, useState } from 'react';
import { Radio, Button } from 'antd';
import { ToTopOutlined, CopyOutlined, HighlightOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { initGraphAttr, basicGraphs, getBasicAttrs, getId, load, initExports, savePaint, cloneModel, wrapperEvents, connectModels, delTarget } from './util';
import BasicGraphAttrContainer from './BasicGraphAttrContainer';
import SelectionAttrContainer from './SelectionAttrContainer';
import PipeAttrContainer from './PipeAttrContainer';
import style from './index.css';

let canvas = null;

function CustomPainter(){
    let [currentTarget, setCurrentTarget] = useState(null);
    let [attrInfo, setAttrInfo] = useState(initGraphAttr);
    let [paintList, setPaintList] = useState([]);
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
                    let id = getId();
                    let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14 } );
                    textObj.objId = id;
                    textObj.set({
                        top:e.offsetY + oImg.height / 2 + 10,
                        left:e.offsetX - textObj.width / 2,
                    });
                    oImg.lockRotation = true;
                    oImg.sourcePath = data.path;
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
                    initExports(oImg);
                    initExports(textObj);
                })
            } else {
                // 基础图形区,
                let id = getId();
                let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14 })
                textObj.objId = id;
                textObj.set({   
                    top:e.offsetY + data.height / 2 + 10,
                    left:e.offsetX - textObj.width / 2,
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
                initExports(graphObj);
                initExports(textObj);
            } 
        });
        // 监听对象的属性，如有变动更新右侧的属性面板
        canvas.on('object:modified', ({ target })=>{
            setAttrInfo(getBasicAttrs(target));
            if ( target.flowArr && target.flowArr.length ) {
                target.flowArr.forEach(obj=>{
                    connectModels(canvas, obj.start, obj.end, obj.direc, obj.objId);
                })
            }
        })
        canvas.on('selection:created',({ selected })=>{
            let selection = canvas.getActiveObject();
            selection.lockRotation = true;
            setCurrentTarget(selection);
        });       
        canvas.on('mouse:down',function(option){
            let { e, target, pointer } = option;  
            if ( target ){
                if ( target.type === 'text' ) return;
                setCurrentTarget(target);
                // if ( e.altKey ){
                //     // 按住ALT键拖动复制选中的对象
                //     cloneModel(canvas, target, pointer);
                // } else {
                    
                // }
            }         
        });
        return ()=>{
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
                    <span className={style['btn']} onClick={()=>{
                        savePaint(canvas, list=>setPaintList(list));
                    }}><SaveOutlined />保存</span>
                    <span className={style['btn']} onClick={()=>{
                        load(canvas);
                    }}>加载</span>
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