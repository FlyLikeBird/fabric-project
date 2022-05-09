import React, { useEffect, useState } from 'react';
import { Button, Input, Radio } from 'antd';
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined, ColumnWidthOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { updatePipeAttr } from './util';
import style from './index.css';

let timer = null;

function PipeAttrContainer({ canvas, currentTarget }){
    let [pipeWidth, setPipeWidth] = useState(currentTarget.pipePath ? currentTarget.pipePath.strokeWidth : 0);
    let [pipeColor, setPipeColor] = useState(currentTarget.pipePath ? currentTarget.pipePath.stroke : '#000000');
    let [flowWidth, setFlowWidth] = useState(currentTarget.strokeWidth);
    let [flowColor, setFlowColor] = useState(currentTarget.stroke);
    useEffect(()=>{
        if ( currentTarget ){
            setPipeWidth(currentTarget.pipePath ? currentTarget.pipePath.strokeWidth : 0);
            setPipeColor(currentTarget.pipePath ? currentTarget.pipePath.stroke : '#000000');
            setFlowWidth(currentTarget.strokeWidth);
            setFlowColor(currentTarget.stroke);
        }
    },[currentTarget]);
    return (
        <div className={style['attr-container']}>
            <div className={style['attr-item-wrapper']}>
                <span>管道宽度:</span>
                <input type='range' min={4} max={30} value={pipeWidth} className={style['attr-input']} onChange={e=>{
                    setPipeWidth(e.target.value);
                    updatePipeAttr(canvas, currentTarget, 'strokeWidth', Number(e.target.value), true );
                }} />
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>管道颜色:</span>
                <input type='color' value={pipeColor} className={style['attr-input']} onChange={e=>{
                    setPipeColor(e.target.value);
                    updatePipeAttr(canvas, currentTarget, 'stroke', e.target.value, true );
                }} />
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>流向宽度:</span>
                <input type='range' min={1} max={20} value={flowWidth} className={style['attr-input']} onChange={e=>{
                    setFlowWidth(e.target.value);
                    updatePipeAttr(canvas, currentTarget, 'strokeWidth', Number(e.target.value));
                }} />
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>流向颜色:</span>
                <input type='color' value={flowColor} className={style['attr-input']} onChange={e=>{
                    setFlowColor(e.target.value);
                    updatePipeAttr(canvas, currentTarget, 'stroke', e.target.value);
                }} />
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentTarget !== nextProps.currentTarget ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(PipeAttrContainer, areEqual);

