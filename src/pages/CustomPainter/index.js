import React, { useEffect, useState, useRef } from 'react';
import { Radio, Button } from 'antd';
import { ToTopOutlined, ClearOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { initGraphAttr, initMachList, graphs, graphTypes, basicGraphs, createGrid, airMachList, getBasicAttrs, getId, load, initExports, savePaint, cloneModel, wrapperEvents, connectModels, delTarget } from './util';
import BasicGraphAttrContainer from './BasicGraphAttrContainer';
import SelectionAttrContainer from './SelectionAttrContainer';
import PipeAttrContainer from './PipeAttrContainer';
import style from './index.css';
import bgImg from '../../../public/canvas_bg.png';
let canvas = null;

function CustomPainter(){
    let [currentTarget, setCurrentTarget] = useState(null);
    let [attrInfo, setAttrInfo] = useState(initGraphAttr);
    let [selectedModels, setSelectedModels] = useState([]);
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
            width:container.offsetWidth - 560,
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
                // ?????????
                fabric.Image.fromURL(data.path, oImg=>{
                    let id = getId();
                    let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14, fill:'#ffffff' } );
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
                    wrapperEvents(oImg, machList);
                    initExports(oImg);
                    initExports(textObj);
                    if ( currentTargetRef.current && currentTargetRef.current.type ) {
                        if ( currentTargetRef.current.type === 'activeSelection' ) {
                            // ???????????????????????????
                            let childNodes = currentTargetRef.current._objects.filter( i => graphTypes.includes(i.type) );
                            let childNodeIds = childNodes.map(i=>i.objId);
                            let selectedModels = canvas.getObjects().filter(i=> graphTypes.includes(i.type)).filter(i=>!childNodeIds.includes(i.objId));
                            setSelectedModels(selectedModels);
                        } else {
                            // ??????????????????????????????
                            let temp = canvas.getObjects().filter(i=>graphTypes.includes(i.type)).filter(i=>i.objId !== currentTargetRef.current.objId);                            
                            setSelectedModels(temp);
                        }  
                    }
                })
            } else {
                // ???????????????,
                let id = getId();
                let textObj = new fabric.Text(id + '-' + data.title, { fontSize:14, fill:'#ffffff' })
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
                wrapperEvents(graphObj, machList);
                initExports(graphObj);
                initExports(textObj);
                // ?????????????????????????????????????????????????????????
                if ( currentTargetRef.current && currentTargetRef.current.type ) {
                    if ( currentTargetRef.current.type === 'activeSelection' ) {
                        // ???????????????????????????
                        let childNodes = currentTargetRef.current._objects.filter( i => graphTypes.includes(i.type) );
                        let childNodeIds = childNodes.map(i=>i.objId);
                        let selectedModels = canvas.getObjects().filter(i=> graphTypes.includes(i.type)).filter(i=>!childNodeIds.includes(i.objId));
                        setSelectedModels(selectedModels);
                    } else {
                        // ??????????????????????????????
                        let temp = canvas.getObjects().filter(i=>graphTypes.includes(i.type)).filter(i=>i.objId !== currentTargetRef.current.objId);                            
                        setSelectedModels(temp);
                    }  
                }
            } 
        });
        // ???????????????????????????????????????????????????????????????
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
            if ( selection.type === 'activeSelection' && selection._objects.length ) {
                let childNodes = selection._objects.filter( i => graphTypes.includes(i.type) );
                let childNodeIds = childNodes.map(i=>i.objId);
                let selectedModels = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && !childNodeIds.includes(i.objId));
                setSelectedModels(selectedModels);
            }    
            setCurrentTarget(selection);
        });       
        canvas.on('mouse:down',function(option){
            let { e, target, pointer } = option; 
            if ( target && target.type !== 'text' && target.type !== 'line' ){
                if ( target.type !== 'polyline' ) {
                    target.lockMovementX = false;
                    target.lockMovementY = false;
                }
                if ( e.altKey ){
                    // ??????ALT?????????????????????????????????????????????????????????
                    if ( target.type !== 'text' && target.type !== 'polyline' ) {
                        cloneModel(canvas, target, pointer, obj=>setCurrentTarget(obj), (arr)=>setSelectedModels(arr));
                    }
                } else {
                    let temp = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.objId !== target.objId);
                    setSelectedModels(temp);
                    setCurrentTarget(target);                          
                }
                
            }      
        });

        return ()=>{
        }  
    },[]);
    return (
        
        <div className={style['main-container']} ref={containerRef}>
            <div className={style['header-container']}>
                {/* ????????? */}
                <div className={style['btn-group']}>      
                    <span className={style['btn']} onClick={()=>{
                        delTarget(canvas, currentTarget);
                    }}><DeleteOutlined style={{ marginRight:'4px' }} />??????</span>
                    <span className={style['btn']} onClick={()=>{
                        canvas.getObjects().filter(i=>graphTypes.includes(i.type)).forEach(obj=>{
                            delTarget(canvas, obj);
                        })
                    }}><ClearOutlined style={{ marginRight:'4px' }} />????????????</span>
                    <span className={style['btn']} onClick={()=>{
                        savePaint(canvas, list=>setPaintList(list));
                    }}><SaveOutlined style={{ marginRight:'4px' }} />????????????</span>
                    <span className={style['btn']} onClick={()=>{
                        load(canvas);
                    }}>????????????</span>
                </div>
            </div>
            <div className={style['content-container']}>
                {/* ??????????????? */}
                <div className={style['model-container']}>
                    {/* ??????????????? */}
                    <div className={style['model-item']}>
                        <div className={style['model-title']}>???????????????</div>
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
                    {/* ?????????????????? */}
                    <div className={style['model-item']}>
                        <div className={style['model-title']}>??????????????????</div>
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
                {/* ????????? */}
                <canvas id='my-canvas'>container</canvas>
                {/* ????????? */}
                
                {
                    currentTarget && currentTarget.type === 'activeSelection' 
                    ?
                    <SelectionAttrContainer canvas={canvas} currentTarget={currentTarget} selectedModels={selectedModels}  />
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
                        selectedModels={selectedModels}
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