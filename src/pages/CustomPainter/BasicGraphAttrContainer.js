import React, { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { fabric } from 'fabric';
import { updateTargetAttr, getBasicAttrs, basicGraphs } from './util';
import style from './index.css';

let timer = null;

function BasicGraphAttrContainer({ canvas, currentTarget, attrInfo, onChangeAttr }){
    useEffect(()=>{
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
    useEffect(()=>{
        if ( currentTarget ){
            onChangeAttr(getBasicAttrs(currentTarget))
        }
    },[currentTarget]);
    // console.log(basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget.type)[0].attrs);
    console.log(currentTarget);
    console.log(attrInfo);

    return (
        <div className={style['attr-container']}>
            {
                currentTarget && currentTarget.type === 'group'
                ?           
                basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget._objects[0].type )[0].attrs.map(attr=>{
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
            <div className={style['attr-item-wrapper']}>
                <span>旋转角度:</span>
                <Input value={attrInfo.angle} className={style['attr-input']} style={{ width:'120px' }} onChange={e=>{
                    console.log(e.target.value);
                    onChangeAttr({ ...attrInfo, angle:e.target.value });
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        updateTargetAttr(canvas, currentTarget, 'angle', Number(e.target.value))
                    },500)
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
                        clearTimeout(timer);
                        timer = setTimeout(()=>{
                            updateTargetAttr(canvas, currentTarget, 'strokeWidth', Number(e.target.value) );
                        },500)
                    }} />
                </div>
                :
                null
            }
            
            <div className={style['attr-item-wrapper']}>
                <Button onClick={()=>{
                    if ( currentTarget ){
                        // 对象重置为初始状态
                        let initState = basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget.type)[0];
                        onChangeAttr({ ...initState.attrs.reduce((sum,cur)=>{
                           sum[cur.attrKey] = cur.attrValue;
                           return sum; 
                        },{}), scaleX:1, scaleY:1, angle:0, fill:'#cccccc', stroke:'#000000', strokeWidth:1  });
                        currentTarget.set({
                            ...initState.info,
                            scaleX:1,
                            scaleY:1,
                            angle:0,
                            fill:'#cccccc',
                            stroke:'#000000',
                            strokeWidth:1
                        });
                        canvas.renderAll();
                    }
                }}>重置</Button>
            </div>
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

