import React, { useEffect, useState } from 'react';
import { Button, Input, Select, message, Radio } from 'antd';
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined, ColumnWidthOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { connectModels } from './util';
import style from './index.css';
const { Option } = Select;
let timer = null;
let posList = [{ title:'左侧', key:'left'}, { title:'顶部', key:'top'}, { title:'右侧', key:'right'}, { title:'底部', key:'bottom' }];

function SelectionAttrContainer({ canvas, currentTarget, attrInfo, onChangeAttr }){
    let [selectedId, setSelectedId] = useState('');
    let [direc, setDirec] = useState('left');
    let [horizonAlign, setHorizonAlign] = useState('');
    let [verticalAlign, setVerticalAlign] = useState('');
    useEffect(()=>{
        if ( currentTarget ){
            // onChangeAttr(getBasicAttrs(currentTarget))
        }
    },[currentTarget]);
    // console.log(basicGraphs.filter(i=>i.type.toLowerCase() === currentTarget.type)[0].attrs);
    let childNodes = currentTarget._objects.filter( i => i.type !== 'text' && i.type !== 'polyline' );
    let childNodeIds = childNodes.map(i=>i.objId);
    let selectedModels = canvas.getObjects().filter(i=> i.type !== 'text' && i.type !== 'polyline' && !childNodeIds.includes(i.objId));
    return (
        <div className={style['attr-container']}>
            <div className={style['attr-item-wrapper']}>
                <span>连接至:</span>
                <Select style={{ width:'120px' }} value={selectedId} onChange={value=>{
                    let temp = selectedModels.filter(i=>i.objId === value)[0];
                    setSelectedId(value);
                    childNodes.forEach(obj=>{
                        let flowId = null;
                        if ( obj.flowArr ) {
                            let result = obj.flowArr.filter(i=>i.end.objId === value )[0];
                            flowId = result ? result.objId : null ;
                        }
                        connectModels(canvas, obj, temp, direc, flowId);
                    })
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
                <span>水平方向:</span>
                <Radio.Group onChange={e=>{
                    let value = e.target.value;
                    let totalObjWidth = 0;
                    currentTarget.forEachObject((obj,index)=>{                        
                        // _getTransformedDimensions的运行原理
                        let dim = obj.getBoundingRect();
                        totalObjWidth += dim.width;
                        if ( value !== 'space' ) {
                            obj.set({
                                left:value === 'left' 
                                    ?
                                    -(currentTarget.width/2 - dim.width/2)
                                    :
                                    value === 'right'
                                    ?
                                    currentTarget.width/2 - dim.width/2
                                    :
                                    0
                            });
                        }
                    });
                    if ( value === 'space' ) {
                        let spaceWidth = ( currentTarget.width - totalObjWidth ) / ( currentTarget._objects.length - 1 );
                        let sum = 0;
                        console.log(spaceWidth);
                        currentTarget._objects.sort((a,b)=>a.left - b.left ).forEach((obj,index)=>{
                            let dim = obj.getBoundingRect();
                            let offsetX = ( sum + index * spaceWidth + dim.width / 2 ) - currentTarget.width / 2
                            sum += dim.width;
                            if ( index === 0 || index === currentTarget._objects.length - 1 ){
                                return ;
                            } else {
                                obj.set({
                                    // 不可交换，确保不改变之前的定位次序
                                    left:offsetX
                                });
                            }  
                        })
                    }
                    canvas.renderAll();
                }}>
                    <Radio.Button value='left' key='left'><AlignLeftOutlined /></Radio.Button>
                    <Radio.Button value='center' key='center'><AlignCenterOutlined /></Radio.Button>
                    <Radio.Button value='right' key='right'><AlignRightOutlined /></Radio.Button>
                    <Radio.Button value='space' key='space'><ColumnWidthOutlined /></Radio.Button>
                </Radio.Group>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>垂直方向:</span>
                <Radio.Group onChange={e=>{
                    let value = e.target.value;
                    let totalObjHeight = 0;
                    currentTarget.forEachObject((obj,index)=>{                        
                        // _getTransformedDimensions的运行原理
                        let dim = obj.getBoundingRect();
                        totalObjHeight += dim.height;
                        if ( value !== 'space' ) {
                            obj.set({
                                top:value === 'top' 
                                    ?
                                    -(currentTarget.height/2 - dim.height/2)
                                    :
                                    value === 'bottom'
                                    ?
                                    currentTarget.height/2 - dim.height/2
                                    :
                                    0
                            });
                        }
                    });
                    if ( value === 'space' ) {
                        let spaceHeight = ( currentTarget.height - totalObjHeight ) / ( currentTarget._objects.length - 1 );
                        let sum = 0;
                        currentTarget._objects.sort((a,b)=>a.top - b.top ).forEach((obj,index)=>{
                            let dim = obj.getBoundingRect();
                            let offsetY = ( sum + index * spaceHeight + dim.height / 2 ) - currentTarget.height / 2;
                            sum += dim.height;
                            if ( index === 0 || index === currentTarget._objects.length - 1 ){
                                return ;
                            } else {
                                obj.set({
                                    // 不可交换，确保不改变之前的定位次序
                                    top:offsetY
                                });
                            }                        
                        })
                    }
                    canvas.renderAll();
                }}>
                    <Radio.Button value='top' key='top'><AlignLeftOutlined rotate={90}/></Radio.Button>
                    <Radio.Button value='middle' key='middle'><AlignCenterOutlined rotate={90}/></Radio.Button>
                    <Radio.Button value='bottom' key='bottom'><AlignRightOutlined rotate={90}/></Radio.Button>
                    <Radio.Button value='space' key='space'><ColumnHeightOutlined /></Radio.Button>
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
export default React.memo(SelectionAttrContainer, areEqual);

