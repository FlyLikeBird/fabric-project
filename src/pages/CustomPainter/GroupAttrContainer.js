import React, { useEffect, useState } from 'react';
import { Button, Input, Radio } from 'antd';
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { updateTargetAttr, getBasicAttrs, basicGraphs } from './util';
import style from './index.css';

let timer = null;

function GroupAttrContainer({ canvas, currentTarget, attrInfo, onChangeAttr }){
    let [horizonAlign, setHorizonAlign] = useState('');
    let [verticalAlign, setVerticalAlign] = useState('');
    useEffect(()=>{
        if ( currentTarget ){
            // onChangeAttr(getBasicAttrs(currentTarget))
        }
    },[currentTarget]);
    // console.log(basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget.type)[0].attrs);
    console.log(currentTarget);
    return (
        <div className={style['attr-container']}>
            <div className={style['attr-item-wrapper']}>
                <span>水平方向:</span>
                <Radio.Group onChange={e=>{
                    currentTarget.forEachObject((obj,index)=>{
                        let matrix = obj.calcTransformMatrix();
                        let skewX = matrix[1], skewY = matrix[2];
                        console.log(matrix);
                        // 搞懂_getTransformedDimensions的运行原理
                        let dim = obj._getTransformedDimensions(skewX, skewY);
                        if ( skewX ){
                            let dim2 = obj._getTransformedDimensions();
                            console.log(dim);
                            console.log(dim2);
                        }
                       
                        obj.set({
                            left:e.target.value === 'left' 
                                ?
                                -(currentTarget.width/2 - dim.x/2)
                                :
                                e.target.value === 'right'
                                ?
                                currentTarget.width/2 - dim.x/2
                                :
                                0
                        })
                    });
                    canvas.renderAll();
                }}>
                    <Radio.Button value='left' key='left'><AlignLeftOutlined /></Radio.Button>
                    <Radio.Button value='center' key='center'><AlignCenterOutlined /></Radio.Button>
                    <Radio.Button value='right' key='right'><AlignRightOutlined /></Radio.Button>
                </Radio.Group>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>垂直方向:</span>
                <Radio.Group onChange={e=>{
                    currentTarget.forEachObject(obj=>{
                        
                    })
                }}>
                    <Radio.Button value='top' key='top'><AlignLeftOutlined /></Radio.Button>
                    <Radio.Button value='middle' key='middle'><AlignCenterOutlined /></Radio.Button>
                    <Radio.Button value='bottom' key='bottom'><AlignRightOutlined /></Radio.Button>
                </Radio.Group>
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
export default React.memo(GroupAttrContainer, areEqual);

