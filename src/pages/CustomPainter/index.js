import React, { useEffect, useState, useRef } from 'react';
import { Radio, Button, Popover } from 'antd';
import { HighlightOutlined, DoubleRightOutlined, DoubleLeftOutlined, ClearOutlined, DeleteOutlined, SaveOutlined, UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { fabric } from '../fabric';
import { initGraphAttr, initMachList, graphs, graphTypes, basicGraphs, airMachList, getBasicAttrs, getId, load, initExports, savePaint, createPath, endPath, cloneModel, wrapperEvents, connectModels, delTarget, delAll } from './util';
import BasicGraphAttrContainer from './BasicGraphAttrContainer';
import SelectionAttrContainer from './SelectionAttrContainer';
import PathAttrContainer from './PathAttrContainer';
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
    let [leftHide, setLeftHide] = useState(false);
    let [rightHide, setRightHide] = useState(false);
    let [isPainting, setPainting] = useState(false);
    let [theme, setTheme] = useState('dark');
    let currentTargetRef = useRef(null);
    let containerRef = useRef(null);
    let isPaintingRef = useRef(null);
    useEffect(()=>{
        currentTargetRef.current = currentTarget;
    },[currentTarget]);
    useEffect(()=>{
        isPaintingRef.current = isPainting;
    },[isPainting])
    useEffect(()=>{
        let container = containerRef.current;
        let ulDom = document.getElementById('custom-context-menu');
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
            let prevPos = { x:e.offsetX, y:e.offsetY };
            let afterPoint = fabric.util.transformPoint(prevPos, fabric.util.invertTransform(canvas.viewportTransform));
            let id = getId();
            if ( data.type === 'Image') {
                // 模型区
                fabric.Image.fromURL(data.path, oImg=>{
                    let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14, fill:'#ffffff', left:afterPoint.x, top:afterPoint.y + oImg.height/2 + 10 , originX:'center', originY:'center', evented:false } );
                    textObj.objId = id;
                    textObj.selectable = false;
                    oImg.sourcePath = data.path;
                    oImg.set({
                        left:afterPoint.x,
                        top:afterPoint.y,
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
                let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14, fill:'#ffffff', left:afterPoint.x, top:afterPoint.y + data.height/2 + 10 , originX:'center', originY:'center',evented:false })
                // 考虑到视图矩阵viewportTransform的影响，修正定位坐标
                textObj.objId = id;
                textObj.selectable = false;
                let graphObj = new fabric[data.type]({
                    ...data.attrs.reduce((sum, cur)=>{
                        sum[cur.attrKey] = cur.attrValue;
                        return sum;
                    },{}),
                    fill:'#cccccc',
                    stroke:'#000000',
                    left:afterPoint.x,
                    top:afterPoint.y,
                    objId:id,
                    // originX:'center',
                    // originY:'center',
                    childNode:textObj,
                    canChecked:true
                });
                canvas.add(textObj);
                canvas.add(graphObj);
                
                // setTimeout(()=>{
                //     let point = graphObj.translateToCenterPoint({ x:800, y:300 }, 1, 1);
                //     console.log(point);
                //     let point2 = graphObj.translateToOriginPoint({ x:800, y:300 }, 0.7, 0.7);
                //     console.log(point2);
                //     graphObj.set({
                //         left:point2.x,
                //         top:point2.y,
                //     });
                
                //     canvas.renderAll();
                // },2000)
                setTimeout(()=>{
                    graphObj.setPositionByOrigin({ x:800, y:300 }, 'left', 'top');
                    canvas.renderAll();
                },2000)
                wrapperEvents(graphObj, machList);
                initExports(graphObj);
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
            ulDom.style.display = 'none';
            if ( isPaintingRef.current ){
                // 自定义绘制模式开启
                createPath(canvas, pointer);
                return ;
            }
            if ( target ){
                if ( target.canChecked ) {
                    if ( e.altKey ){
                        // 按住ALT键拖动复制选中的对象，只能复制模型对象
                        cloneModel(canvas, target, pointer, obj=>setCurrentTarget(obj), (arr)=>setAllModels(arr));
                    } else {
                        let temp = canvas.getObjects().filter(i=> i.canChecked && i.objId !== target.objId);
                        setAllModels(temp);
                    }
                    setCurrentTarget(target);  
                }
            }      
        });
        // 监听全局的拖动和缩放事件
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
        document.oncontextmenu = function(e){
            if ( isPaintingRef.current ){
                let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
                ulDom.style.left = e.clientX + scrollLeft + 'px';
                ulDom.style.top = e.clientY + scrollTop + 'px';
                ulDom.style.display = 'block';
            }
            return false;
        }
        return ()=>{
            canvas = null;
        }  
    },[]);
    return (
        
        <div className={style['main-container']} ref={containerRef}>
            <ul id='custom-context-menu' className={style['custom-contextmenu']}>
                <li onClick={()=>{
                    setPainting(false);
                    endPath(canvas);                 
                }}>结束绘制</li>
            </ul>
            <div className={style['header-container']}>
                {/* 操作区 */}
                <div className={style['btn-group']}>      
                    <span className={style['btn']} onClick={()=>{
                        delTarget(canvas, currentTarget);
                    }}><DeleteOutlined style={{ marginRight:'4px' }} />删除</span>
                    <span className={style['btn']} onClick={()=>{
                        delAll(canvas);
                        
                    }}><ClearOutlined style={{ marginRight:'4px' }} />清除画布</span>
                    <span className={style['btn']} onClick={()=>{
                        savePaint(canvas, list=>setPaintList(list));
                    }}><SaveOutlined style={{ marginRight:'4px' }} />保存画布</span>
                    <span className={style['btn']} onClick={()=>{
                        load(canvas);
                    }}><UploadOutlined style={{ marginRight:'4px' }} />加载资源</span>
                    <Popover title='快捷组合键' content={(
                        <div>
                            <p>按住<span style={{ fontWeight:'bold', margin:'0 6px' }}>空格键+拖动鼠标</span>可拖动整体画布</p>
                            <p>按住<span style={{ fontWeight:'bold', margin:'0 6px' }}>ALT键+鼠标滚轮</span>可缩放整体画布</p>
                            <p>按住<span style={{ fontWeight:'bold', margin:'0 6px' }}>ALT键+拖动对象</span>可复制对象</p>
                        </div>
                    )}>
                        <span className={style['btn']}><QuestionCircleOutlined style={{ marginRight:'4px' }} />快捷指引</span>
                    </Popover>
                </div>
            </div>
            <div className={style['content-container']}>
                <div className={style['hide-btn']} onClick={()=>setLeftHide(!leftHide)} style={{ left: leftHide ? '0' : 'calc( 12% - 36px)' }}>{ leftHide ? <DoubleRightOutlined /> : <DoubleLeftOutlined /> }</div>
                {/* 模型导入区 */}
                <div className={style['model-container']} style={{ left:leftHide ? '-12%' : '0' }}>
                    {/* 自定义区 */}
                    <div className={style['model-item']}>
                        <div className={style['model-title']}>自定义区</div>
                        <div className={style['model-content']}>
                            <div className={style['item-wrapper']} style={{ height:'90px', cursor:'pointer' }}>
                                <div className={style['item-container']} onClick={()=>{
                                    let result = !isPainting;
                                    setPainting(result);
                                    if ( result ){
                                        canvas.defaultCursor = 'crosshair';
                                    } else {
                                        canvas.defaultCursor = 'default';
                                    }
                                }}>
                                    <div className={style['img-container']}><HighlightOutlined style={{ fontSize:'2.4rem', color:isPainting ? '#1890ff' : '#fff' }} /></div>
                                    <div className={style['item-text']}>自定义路径</div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        <PathAttrContainer canvas={canvas} currentTarget={currentTarget} attrInfo={attrInfo} onChangeAttr={(option)=>setAttrInfo(option)} />
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