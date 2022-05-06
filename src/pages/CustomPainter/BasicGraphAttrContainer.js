import React, { useEffect, useState } from 'react';
import { Button, Input, Select, message } from 'antd';
import { fabric } from 'fabric';
import { updateTargetAttr, updateTextAttr, getBasicAttrs, basicGraphs, connectModels } from './util';
import style from './index.css';
const { Option } = Select;
let timer = null;
let posList = [{ title:'左侧', key:'left'}, { title:'顶部', key:'top'}, { title:'右侧', key:'right'}, { title:'底部', key:'bottom' }];
function BasicGraphAttrContainer({ canvas, currentTarget, attrInfo, onChangeAttr }){
    let [direc, setDirec] = useState('left');
    let [selectedId, setSelectedId] = useState('');
    useEffect(()=>{
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
    useEffect(()=>{
        if ( currentTarget ){
            onChangeAttr(getBasicAttrs(currentTarget));
            if ( currentTarget.flowArr ){
                let flowObj = currentTarget.flowArr[0];
                setSelectedId(flowObj.end.objId);
                setDirec(flowObj.direc);
            } else {
                setSelectedId('');
                setDirec('left');
            }
        }
    },[currentTarget]);
    // console.log(basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget.type)[0].attrs);
    let selectedModels = canvas.getObjects().filter(i=> i.type !== 'text' && i.type !== 'polyline' && i.objId !== currentTarget.objId);
    return (
        <div className={style['attr-container']}>
            {/* 源对象和目标对象的流向定义 */}
            <div className={style['attr-item-wrapper']}>
                <span>连接至:</span>
                <Select style={{ width:'120px' }} value={selectedId} onChange={value=>{
                    let temp = selectedModels.filter(i=>i.objId === value)[0];
                    setSelectedId(value);
                    connectModels(canvas, currentTarget, temp, direc);
                }}>
                    {
                        selectedModels.map((obj)=>(
                            <Option key={obj.objId} value={obj.objId}>{ obj.childNode.text }</Option>
                        ))
                    }
                </Select>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>连接方向:</span>
                <Select style={{ width:'120px' }} value={direc} onChange={value=>{
                    setDirec(value);
                    let temp = selectedModels.filter(i=>i.objId === selectedId)[0];
                    if ( temp ){
                        connectModels(canvas, currentTarget, temp, value);
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
                <Input value={attrInfo.text} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
                    onChangeAttr({ ...attrInfo, text:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTextAttr(canvas, currentTarget, 'text', e.target.value)
                    },500)
                }} />  
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>标题大小:</span>
                <Input value={attrInfo.fontSize} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
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
                basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget.type )[0].attrs.map(attr=>{
                    return (<div className={style['attr-item-wrapper']} key={attr.attrKey}>
                        <span>{ attr.attrName }:</span>
                        <Input value={attrInfo[attr.attrKey]} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
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
                <Input value={attrInfo.scaleX} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
                    onChangeAttr({ ...attrInfo, scaleX:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTargetAttr(canvas, currentTarget, 'scaleX', Number(e.target.value))
                    },500)
                }} />  
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>Y轴缩放:</span>
                <Input value={attrInfo.scaleY} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
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
                    <Input value={attrInfo.angle} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
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
            
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentTarget !== nextProps.currentTarget || prevProps.attrInfo !== nextProps.attrInfo ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(BasicGraphAttrContainer, areEqual);

