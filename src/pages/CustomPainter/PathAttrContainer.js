import React, { useEffect, useState } from 'react';
import { Button, Input, Slider, Radio } from 'antd';
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined, ColumnWidthOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import { getBasicAttrs, updateTargetAttr, editPath } from './util';
import style from './index.css';

let timer = null;

function PipeAttrContainer({ canvas, currentTarget, attrInfo, onChangeAttr }){
    let [isEditing, setEditing] = useState(false);
    useEffect(()=>{
        if ( currentTarget ){
            onChangeAttr(getBasicAttrs(currentTarget));
        }
    },[currentTarget]);
    console.log(currentTarget);
    return (
        <div className={style['attr-container']}>
            <div className={style['attr-item-wrapper']}>
                <Button type='primary' onClick={()=>{
                    let result = !isEditing;
                    setEditing(result);
                    editPath(canvas, currentTarget, result);
                }}>{ isEditing ? '取消编辑' : '编辑模式' }</Button>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>路径宽度:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={10} disabled={ isEditing ? true : false } value={attrInfo.strokeWidth} step={1} onChange={value=>{
                        onChangeAttr({ ...attrInfo, strokeWidth:value });
                        updateTargetAttr(canvas, currentTarget, 'strokeWidth', value)
                    }}/>
                </div>    
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>路径颜色:</span>
                <div className={style['attr-item-control']}>
                    <input type='color' disabled={ isEditing ? true : false } value={attrInfo.stroke} className={style['attr-input']} onChange={e=>{
                        onChangeAttr({ ...attrInfo, stroke:e.target.value });
                        updateTargetAttr(canvas, currentTarget, 'stroke', e.target.value);                 
                    }} />
                </div>        
                </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>X轴缩放:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={5} disabled={ isEditing ? true : false } value={attrInfo.scaleX} step={0.1} onChange={value=>{
                        onChangeAttr({ ...attrInfo, scaleX:value });
                        updateTargetAttr(canvas, currentTarget, 'scaleX', value)
                    }}/>
                </div>            
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>Y轴缩放:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={5} disabled={ isEditing ? true : false } value={attrInfo.scaleY} step={0.1} onChange={value=>{
                        onChangeAttr({ ...attrInfo, scaleY:value });
                        updateTargetAttr(canvas, currentTarget, 'scaleY', value)
                    }}/>
                </div>                  
            </div>
            
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>旋转角度:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={360} disabled={ isEditing ? true : false } value={attrInfo.angle} onChange={value=>{
                        onChangeAttr({ ...attrInfo, angle:value });
                        updateTargetAttr(canvas, currentTarget, 'angle', value)
                    }}/>
                </div>                 
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
export default React.memo(PipeAttrContainer, areEqual);

