import React, { useEffect, useState, useRef } from 'react';
import { Radio, Button } from 'antd';
import { ToTopOutlined, ClearOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { fabric } from '../fabric';
import { initGraphAttr, initMachList, graphs, graphTypes, basicGraphs, createGrid, airMachList, getBasicAttrs, getId, load, initExports, savePaint, cloneModel, wrapperEvents, connectModels, delTarget } from './util';
import BasicGraphAttrContainer from './BasicGraphAttrContainer';
import SelectionAttrContainer from './SelectionAttrContainer';
import PipeAttrContainer from './PipeAttrContainer';
import style from './index.css';
let canvas = null;
let isDragging = false;
let clickX = 0, clickY = 0;
let prevMatrix = [];
function CustomPainter(){
    let [currentTarget, setCurrentTarget] = useState(null);
    let [attrInfo, setAttrInfo] = useState(initGraphAttr);
    let [allModels, setAllModels] = useState([]);
    let [machList, setMachList] = useState(initMachList);
    let [paintList, setPaintList] = useState([]);
    let currentTargetRef = useRef(null);
    let containerRef = useRef(null);
    useEffect(()=>{
        currentTargetRef.current = currentTarget;
    },[currentTarget])
    useEffect(()=>{
        let container = containerRef.current;
        canvas = new fabric.Canvas('my-canvas',{
            backgroundColor:'#181e25',
            selection:true,
            preserveObjectStacking:true,
            width:container.offsetWidth,
            height:container.offsetHeight - 34
        });
        // canvas.setBackgroundImage(bgImg, canvas.renderAll.bind(canvas))
        // createGrid(canvas);
        fabric.Object.prototype.transparentCorners = false;
        document.addEventListener('dragstart',e=>{
            if ( e.target ){
                let graphObj = graphs.filter(i=>i.key === e.target.getAttribute('data-graph-key'))[0];      
                e.dataTransfer.setData('text/plain', JSON.stringify(graphObj));
            }
        })
        canvas.on('drop',({ e })=>{
            let data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if ( data.type === 'Image') {
                // 模型区
                fabric.Image.fromURL(data.path, oImg=>{
                    let id = getId();
                    let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14, fill:'#ffffff', evented:false } );
                    textObj.objId = id;
                    textObj.set({
                        top: e.offsetY + oImg.height / 2 + 10,
                        left:e.offsetX - textObj.width / 2,
                    });
                    textObj.selectable = false;
                    oImg.sourcePath = data.path;
                    oImg.set({
                        left: e.offsetX,
                        top:e.offsetY,
                        originX:'center',
                        originY:'center',
                        childNode:textObj,
                        objId:id,
                        canChecked:true
                    });
                    canvas.add(textObj);
                    canvas.add(oImg);
                    wrapperEvents(oImg, machList);
                    initExports(oImg);
                    initExports(textObj);
                    if ( currentTargetRef.current && currentTargetRef.current.type ) {
                        if ( currentTargetRef.current.type === 'activeSelection' ) {
                            // 当选取对象为集合时
                            let childNodes = currentTargetRef.current._objects.filter( i => graphTypes.includes(i.type) && i.canChecked );
                            let childNodeIds = childNodes.map(i=>i.objId);
                            let temp = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.canChecked ).filter(i=>!childNodeIds.includes(i.objId));
                            setAllModels(temp);
                        } else {
                            // 当选取对象为单个对象
                            let temp = canvas.getObjects().filter(i=>graphTypes.includes(i.type) && i.canChecked ).filter(i=>i.objId !== currentTargetRef.current.objId);                            
                            setAllModels(temp);
                        }  
                    }
                })
            } else {
                // 基础图形区,
                let id = getId();
                let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14, fill:'#ffffff', evented:false })
                // 考虑到视图矩阵viewportTransform的影响，修正定位坐标
                let viewportMatrix = canvas.viewportTransform;
                let prevPos = { x:e.offsetX, y:e.offsetY };
                // let afterPoint = fabric.util.transformPoint(prevPos, fabric.util.invertTransform(canvas.viewportTransform));
                let afterPoint = fabric.util.transformPoint(prevPos, viewportMatrix);
                console.log(prevPos);
                console.log(afterPoint);
                textObj.objId = id;
                textObj.set({   
                    top:e.offsetY + data.height / 2 + 10,
                    left:e.offsetX - textObj.width / 2,
                });
                textObj.selectable = false;
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
                    childNode:textObj,
                    canChecked:true
                });
                console.log(graphObj.width, graphObj.height);
                canvas.add(textObj);
                canvas.add(graphObj);
                wrapperEvents(graphObj, machList);
                initExports(graphObj);
               
                // setTimeout(()=>{
                //     console.log('1---');
                //     canvas.setViewportTransform([1, 0 , 0, 1, 100, 75]);                    
                //     setTimeout(()=>{
                //         console.log('2---');
                //         canvas.zoomToPoint({ x:e.offsetX + 100 , y:e.offsetY + 75 }, 2);
                        
                //     },2000)
                // },2000)
                initExports(textObj);
                // 当新模型拖入绘图区，更新可连接对象列表
                if ( currentTargetRef.current && currentTargetRef.current.type ) {
                    if ( currentTargetRef.current.type === 'activeSelection' ) {
                        // 当选取对象为集合时
                        let childNodes = currentTargetRef.current._objects.filter( i => graphTypes.includes(i.type) && i.canChecked );
                        let childNodeIds = childNodes.map(i=>i.objId);
                        let selectedModels = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.canChecked ).filter(i=>!childNodeIds.includes(i.objId));
                        setAllModels(selectedModels);
                    } else {
                        // 当选取对象为单个对象
                        let temp = canvas.getObjects().filter(i=>graphTypes.includes(i.type) && i.canChecked ).filter(i=>i.objId !== currentTargetRef.current.objId);                            
                        setAllModels(temp);
                    }  
                }
            } 
        });
        // 监听对象的属性，如有变动更新右侧的属性面板,更新管道信息
        canvas.on('object:modified', ({ target })=>{
            setAttrInfo(getBasicAttrs(target));
            let allModels = canvas.getObjects().filter(i=>graphTypes.includes(i.type) && i.canChecked );
            if ( target.flowArr && target.flowArr.length ) {
                target.flowArr.forEach(obj=>{
                    let startObj = allModels.filter(i=>i.objId === obj.start )[0];
                    let endObj = allModels.filter(i=>i.objId === obj.end)[0];
                    connectModels(canvas, startObj, endObj, obj.opts, obj.objId, false);
                })
            }
        })
        canvas.on('selection:created',({ selected })=>{
            let selection = canvas.getActiveObject();
            if ( selection.type === 'activeSelection' && selection._objects.length ) {
                let childNodes = selection._objects.filter( i => graphTypes.includes(i.type) && i.canChecked );
                let childNodeIds = childNodes.map(i=>i.objId);
                let temp = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && !childNodeIds.includes(i.objId));
                setAllModels(temp);
            }    
            setCurrentTarget(selection);
        });       
        canvas.on('mouse:down',function(option){
            let { e, target, pointer } = option; 
            console.log(e);
            console.log(target);
            if ( target && graphTypes.includes(target.type) ){
                if ( e.altKey ){
                    // 按住ALT键拖动复制选中的对象，只能复制模型对象
                    cloneModel(canvas, target, pointer, obj=>setCurrentTarget(obj), (arr)=>setAllModels(arr));
                } else {
                    let temp = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.canChecked && i.objId !== target.objId);
                    setAllModels(temp);
                    setCurrentTarget(target);    
                    console.log(target);
                }
            }      
        });
        // 监听全局的拖动和缩放事件
        
        console.log(canvas);
        canvas.on('mouse:wheel',({ e })=>{
            let delta = e.deltaY;
            if ( e.altKey ){
                let zoom = canvas.getZoom();
                if ( delta < 0 ) {
                    zoom += 0.1;
                }
                if ( delta > 0 ){
                    zoom -= 0.1;
                }
                if ( zoom > 20 ) zoom = 20;
                if ( zoom < 0.1 ) zoom = 0.1;
                canvas.zoomToPoint({
                    x:e.offsetX,
                    y:e.offsetY
                },zoom)
            }      
        })
        document.addEventListener('keydown', (e)=>{
            if ( !isDragging && ( e.keyCode === 32 || e.which === 32 )) {
                canvas.selection = false;
                canvas.defaultCursor = 'grab';
                // canvas.set({ selectable:false, anchor:'grab' });
                var handleMouseMove = ({ e, pointer })=>{
                    // console.log(e);
                    let offsetX = pointer.x - clickX;
                    let offsetY = pointer.y - clickY;
                    // canvas.viewportTransform = [1, 0, 0, 1, prevMatrix[4] + offsetX, prevMatrix[5] + offsetY];  
                    canvas.setViewportTransform([prevMatrix[0], 0, 0, prevMatrix[3], prevMatrix[4] + offsetX, prevMatrix[5] + offsetY]);                
                    // canvas._objects.forEach(obj=>{                        
                    //     obj.set({ left:obj.initLeft + offsetX , top:obj.initTop + offsetY });
                    // });
                    canvas.renderAll();
                }
                var handleMouseDown = ({ e, pointer })=>{
                    clickX = pointer.x;
                    clickY = pointer.y;
                    prevMatrix = canvas.viewportTransform;
                    // canvas._objects.forEach(obj=>{
                    //     obj.initLeft = obj.left;
                    //     obj.initTop = obj.top;
                    // });
                    canvas.on('mouse:move', handleMouseMove);
                    canvas.on('mouse:up', ()=>{
                        canvas.off('mouse:move', handleMouseMove);
                    })
                }
                canvas.on('mouse:down', handleMouseDown);
                isDragging = true;   
                document.addEventListener('keyup', ()=>{
                    isDragging = false;
                    canvas.selection = true;
                    canvas.defaultCursor = 'default';
                    clickX = 0;
                    clickY = 0;
                    prevMatrix = [];  
                    canvas.off('mouse:down', handleMouseDown);
                })             
            }
        })
       
        return ()=>{
        }  
    },[]);
    return (
        
        <div className={style['main-container']} ref={containerRef}>
            <div className={style['header-container']}>
                {/* 操作区 */}
                <div className={style['btn-group']}>      
                    <span className={style['btn']} onClick={()=>{
                        delTarget(canvas, currentTarget);
                    }}><DeleteOutlined style={{ marginRight:'4px' }} />删除</span>
                    <span className={style['btn']} onClick={()=>{
                        canvas.getObjects().filter(i=>graphTypes.includes(i.type)).forEach(obj=>{
                            delTarget(canvas, obj);
                        })
                    }}><ClearOutlined style={{ marginRight:'4px' }} />清除画布</span>
                    <span className={style['btn']} onClick={()=>{
                        savePaint(canvas, list=>setPaintList(list));
                    }}><SaveOutlined style={{ marginRight:'4px' }} />保存画布</span>
                    <span className={style['btn']} onClick={()=>{
                        load(canvas);
                    }}>加载资源</span>
                </div>
            </div>
            <div className={style['content-container']}>
                {/* 模型导入区 */}
                <div className={style['model-container']}>
                    {/* 基础图形区 */}
                    <div className={style['model-item']}>
                        <div className={style['model-title']}>基础图形区</div>
                        <div className={style['model-content']}>
                            {
                                basicGraphs.map((item,i)=>(
                                    <div className={style['item-wrapper']} key={item.key}>
                                        <div className={style['item-container']}>
                                            <div className={style['img-container']}><img src={item.path} draggable={true} data-graph-key={item.key} style={{ cursor:'grab' }} /></div>
                                            <div className={style['item-text']}>{ item.title }</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    {/* 第三方模型区 */}
                    <div className={style['model-item']}>
                        <div className={style['model-title']}>空压机模型区</div>
                        <div className={style['model-content']}>
                            {
                                airMachList.map((item,i)=>(
                                    <div className={style['item-wrapper']} key={item.key}>
                                        <div className={style['item-container']} >
                                            <div className={style['img-container']}><img src={item.path} draggable={true} data-graph-key={item.key} style={{ cursor:'grab' }} /></div>
                                            <div className={style['item-text']}>{ item.title }</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                {/* 绘图区 */}
                <canvas id='my-canvas'>container</canvas>
                {/* 属性区 */}
                
                {
                    currentTarget && currentTarget.type === 'activeSelection' 
                    ?
                    null
                    // <SelectionAttrContainer canvas={canvas} currentTarget={currentTarget} selectedModels={selectedModels}  />
                    :
                    currentTarget && currentTarget.type === 'polyline' 
                    ?
                    <PipeAttrContainer canvas={canvas} currentTarget={currentTarget} />
                    :
                    currentTarget
                    ?
                    <BasicGraphAttrContainer 
                        canvas={canvas} 
                        currentTarget={currentTarget} 
                        attrInfo={attrInfo} 
                        allModels={allModels}
                        machList={machList}
                        onChangeAttr={(option)=>setAttrInfo(option)} 
                    />
                    :
                    null
                }
                    
            </div>
        </div>
       
    )
}

export default CustomPainter;