import React, { useEffect, useState } from 'react';
import { Button, Input, Select, message } from 'antd';
import { fabric } from 'fabric';
import { updateTargetAttr, updateTextAttr, getBasicAttrs,  graphs, graphTypes, connectModels } from './util';
import style from './index.css';
const { Option } = Select;
let timer = null;
let posList = [{ title:'左侧', key:'left'}, { title:'顶部', key:'top'}, { title:'右侧', key:'right'}, { title:'底部', key:'bottom' }];
function BasicGraphAttrContainer({ canvas, currentTarget, attrInfo, selectedModels, machList, onChangeAttr }){
    let [direc, setDirec] = useState('left');
    let [selectedId, setSelectedId] = useState('');
    let [machId, setMachId] = useState(0);
    useEffect(()=>{
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
    useEffect(()=>{
        if ( currentTarget ){
            onChangeAttr(getBasicAttrs(currentTarget));
            if ( currentTarget.machId ) {
                setMachId(currentTarget.machId);
            } else {
                setMachId(0);
            }
            if ( currentTarget.flowArr ){
                let flowObj = currentTarget.flowArr.filter(i=>i.end.objId !== currentTarget.objId)[0];
                if ( flowObj ) {
                    setSelectedId(flowObj.end.objId);
                    setDirec(flowObj.direc);
                } else {
                    setSelectedId('');
                    setDirec('left');
                }
            } else {
                setSelectedId('');
                setDirec('left');
            }
        }
    },[currentTarget]);
    
    let selectedMachs = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.objId !== currentTarget.objId ).map(i=>i.machId);
   
    return (
        <div className={style['attr-container']}>
            {/* 绑定数据源 */}
            <div className={style['attr-item-wrapper']}>
                <span>绑定电表:</span>
                <div style={{ display:'inline-flex' }}>
                    <Select style={{ width:'120px' }} value={machId} onChange={value=>{
                        let temp = machList.filter(i=>i.key === value)[0];
                        currentTarget.machId = value;
                        message.success(`绑定至${temp.title}成功`);
                        setMachId(value);
                    }}>
                        {
                            machList.length 
                            ?
                            machList.filter(i=>!selectedMachs.includes(i.key)).concat({ key:0, title:'还未绑定' }).map(obj=>(
                                <Option key={obj.key} value={obj.key} >{ obj.title }</Option>
                            ))
                            :
                            <Option>没有可绑定的电表</Option>
                        }
                    </Select>
                    { currentTarget.machId ? <Button type='primary' onClick={()=>{
                        let temp = machList.filter(i=>i.key === currentTarget.machId)[0];
                        message.info(`解绑${temp.title}成功`);
                        currentTarget.machId = null;
                        setMachId(0);
                    }}>解绑</Button> : null }
                </div>
            </div>
            {/* 源对象和目标对象的流向定义 */}
            <div className={style['attr-item-wrapper']}>
                <span>连接至:</span>
                <Select  value={selectedId} onChange={value=>{
                    let temp = selectedModels.filter(i=>i.objId === value)[0];
                    let flowId = null;
                    if ( currentTarget.flowArr ) {
                        let result = currentTarget.flowArr.filter(i=>i.end.objId === value )[0];
                        flowId = result ? result.objId : null ;
                    }
                    setSelectedId(value);
                    connectModels(canvas, currentTarget, temp, direc, flowId);
                }}>
                    {
                        selectedModels.length 
                        ?
                        selectedModels.map((obj)=>(
                            <Option key={obj.objId} value={obj.objId}>{ obj.childNode.text }</Option>
                        ))
                        :
                        <Option>没有可连接的模型</Option>
                    }
                </Select>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>连接方向:</span>
                <Select  value={direc} onChange={value=>{
                    setDirec(value);
                    let temp = selectedModels.filter(i=>i.objId === selectedId)[0];
                    let flowId = null;
                    if ( temp ){
                        if ( currentTarget.flowArr ) {
                            let result = currentTarget.flowArr.filter(i=>i.end.objId === selectedId )[0];
                            flowId = result ? result.objId : null;
                        }
                        connectModels(canvas, currentTarget, temp, value, flowId);
                    } else {
                        message.info('请选择要连接的模型对象');
                    }
                }}>
                    {
                        posList.map((item)=>(
                            <Option key={item.key} value={item.key}>{ item.title }</Option>
                        ))
                    }
                </Select>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>模型标题:</span>
                <Input value={attrInfo.text} className={style['attr-input']}  onChange={e=>{
                    onChangeAttr({ ...attrInfo, text:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTextAttr(canvas, currentTarget, 'text', e.target.value)
                    },500)
                }} />  
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>标题大小:</span>
                <Input value={attrInfo.fontSize} className={style['attr-input']}  onChange={e=>{
                    onChangeAttr({ ...attrInfo, fontSize:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTextAttr(canvas, currentTarget, 'fontSize', Number(e.target.value))
                    },500)
                }} />  
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>标题颜色:</span>
                <input type='color' value={attrInfo.fontColor} className={style['attr-input']} onChange={e=>{
                    onChangeAttr({ ...attrInfo, fontColor:e.target.value });
                    updateTextAttr(canvas, currentTarget, 'fontColor', e.target.value);                 
                }} />
            </div>
            {
                currentTarget.type !== 'image' 
                ?
                <div className={style['attr-item-wrapper']}>
                    <span>填充颜色:</span>
                    <input type='color' value={attrInfo.fill} className={style['attr-input']} onChange={e=>{
                        onChangeAttr({ ...attrInfo, fill:e.target.value });
                        updateTargetAttr(canvas, currentTarget, 'fill', e.target.value);                 
                    }} />
                </div>
                :
                null
            }
            {
                currentTarget.type !== 'image'
                ?
                <div className={style['attr-item-wrapper']}>
                    <span>描边颜色:</span>
                    <input type='color' value={attrInfo.stroke} className={style['attr-input']} onChange={e=>{
                        onChangeAttr({ ...attrInfo, stroke:e.target.value });
                        updateTargetAttr(canvas, currentTarget, 'stroke', e.target.value );
                    }} />
                </div>
                :
                null
            }
            {
                currentTarget.type !== 'image' 
                ?
                <div className={style['attr-item-wrapper']}>
                    <span>描边宽度:</span>
                    <input type='range' min={0} max={10} value={attrInfo.strokeWidth} className={style['attr-input']} onChange={e=>{
                        onChangeAttr({ ...attrInfo, strokeWidth:e.target.value });
                        updateTargetAttr(canvas, currentTarget, 'strokeWidth', Number(e.target.value) );
                    }} />
                </div>
                :
                null
            }
            {
                currentTarget && currentTarget.type
                ?           
                graphs.filter(i=>i.type.toLowerCase() === currentTarget.type )[0].attrs.map(attr=>{
                    return (<div className={style['attr-item-wrapper']} key={attr.attrKey}>
                        <span>{ attr.attrName }:</span>
                        <Input value={attrInfo[attr.attrKey]} className={style['attr-input']}  onChange={e=>{
                            onChangeAttr({ ...attrInfo, [attr.attrKey]:e.target.value });
                            clearTimeout(timer);
                            timer = setTimeout(()=>{
                                updateTargetAttr(canvas, currentTarget, attr.attrKey, Number(e.target.value))
                            },500);
                        }} />
                    </div>)
                })
                :
                null
            }
            <div className={style['attr-item-wrapper']}>
                <span>X轴缩放:</span>
                <Input value={attrInfo.scaleX} className={style['attr-input']}  onChange={e=>{
                    onChangeAttr({ ...attrInfo, scaleX:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTargetAttr(canvas, currentTarget, 'scaleX', Number(e.target.value))
                    },500)
                }} />  
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>Y轴缩放:</span>
                <Input value={attrInfo.scaleY} className={style['attr-input']}  onChange={e=>{
                    onChangeAttr({ ...attrInfo, scaleY:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTargetAttr(canvas, currentTarget, 'scaleY', Number(e.target.value))
                    },500)
                }} />  
            </div>
            {
                currentTarget.type !== 'image'
                ?
                <div className={style['attr-item-wrapper']}>
                    <span>旋转角度:</span>
                    <Input value={attrInfo.angle} className={style['attr-input']}  onChange={e=>{
                        onChangeAttr({ ...attrInfo, angle:e.target.value });
                        clearTimeout(timer);
                        timer = setTimeout(()=>{
                            updateTargetAttr(canvas, currentTarget, 'angle', Number(e.target.value))
                        },500)
                    }} />  
                </div>
                :
                null
            }
            <Button type='primary' style={{ margin:'1rem ' }} danger onClick={()=>{
                if ( currentTarget.flowArr ) {
                    let flowObj = currentTarget.flowArr[0];
                    flowObj.set({ stroke:'#ff0000'});
                    canvas.renderAll();
                }
            }}>模拟告警信息</Button>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentTarget !== nextProps.currentTarget 
        || prevProps.attrInfo !== nextProps.attrInfo 
        || prevProps.selectedModels !== nextProps.selectedModels 
        || prevProps.machList !== nextProps.machList
    ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(BasicGraphAttrContainer, areEqual);

