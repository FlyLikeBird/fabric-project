import React, { useEffect, useState } from 'react';
import { Button, Input, Select, message, Radio } from 'antd';
import { AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined, ColumnWidthOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { connectModels, graphTypes } from './util';
import style from './index.css';
const { Option } = Select;
let timer = null;
let posList = [{ title:'左侧', key:'left'}, { title:'顶部', key:'top'}, { title:'右侧', key:'right'}, { title:'底部', key:'bottom' }];

function SelectionAttrContainer({ canvas, currentTarget, selectedModels }){
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
    return (
        <div className={style['attr-container']}>
            <div className={style['attr-item-wrapper']}>
                <span>连接至:</span>
                <Select style={{ width:'120px' }} value={selectedId} onChange={value=>{
                    let temp = selectedModels.filter(i=>i.objId === value)[0];
                    setSelectedId(value);
                    currentTarget._objects.filter(i=>graphTypes.includes(i.type)).forEach(obj=>{
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
                            <Option key={obj.objId} value={obj.objId}>{ obj.childNode ? obj.childNode.text : '' }</Option>
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
                        currentTarget._objects.filter(i=>graphTypes.includes(i.type)).forEach(obj=>{
                            let flowId = null;
                            if ( obj.flowArr ) {
                                let result = obj.flowArr.filter(i=>i.end.objId === selectedId )[0];
                                flowId = result ? result.objId : null ;
                            }
                            connectModels(canvas, obj, temp, value, flowId);
                        })
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
                <Radio.Group value={horizonAlign} onChange={e=>{
                    let value = e.target.value;
                    let totalObjWidth = 0;
                    currentTarget._objects.filter(i=>i.type !== 'text' && i.type !== 'polyline').forEach((obj,index)=>{                        
                        // _getTransformedDimensions的运行原理
                        let dim = obj.getBoundingRect();
                        totalObjWidth += dim.width;
                        let pos = 
                            value === 'left' 
                            ? 
                            -(currentTarget.width/2 - dim.width/2)
                            :
                            value === 'right'
                            ?
                            currentTarget.width/2 - dim.width/2
                            :
                            0;
                        if ( value !== 'space' ) {
                            obj.set({ left:pos });
                            if ( obj.childNode ){
                                obj.childNode.set({ left:pos - obj.childNode.width/2 });
                            }
                            
                        }
                    });
                    if ( value === 'space' ) {
                        let objectArr = currentTarget._objects.filter(i=>i.type !== 'text' && i.type !== 'polyline').sort((a,b)=>a.left - b.left );
                        let spaceWidth = ( currentTarget.width - totalObjWidth ) / ( objectArr.length - 1 );
                        let sum = 0;
                        objectArr.forEach((obj,index)=>{ 
                            let dim = obj.getBoundingRect();
                            let offsetX = ( sum + index * spaceWidth + dim.width / 2 ) - currentTarget.width / 2
                            sum += dim.width;
                            if ( index === 0 || index === objectArr.length - 1 ){
                                return ;
                            } else {
                                obj.set({
                                    // 不可交换，确保不改变之前的定位次序
                                    left:offsetX
                                });
                                if ( obj.childNode ){
                                    obj.childNode.set({ left:offsetX - obj.childNode.width / 2});
                                }
                            }  
                        })
                    }
                    canvas.renderAll();
                    setHorizonAlign(value);
                }}>
                    <Radio.Button value='left' key='left'><AlignLeftOutlined /></Radio.Button>
                    <Radio.Button value='center' key='center'><AlignCenterOutlined /></Radio.Button>
                    <Radio.Button value='right' key='right'><AlignRightOutlined /></Radio.Button>
                    <Radio.Button value='space' key='space'><ColumnWidthOutlined /></Radio.Button>
                </Radio.Group>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span>垂直方向:</span>
                <Radio.Group value={verticalAlign} onChange={e=>{
                    let value = e.target.value;
                    let totalObjHeight = 0;
                    currentTarget._objects.filter(i=>i.type !== 'text' && i.type !== 'polyline').forEach((obj,index)=>{                        
                        // _getTransformedDimensions的运行原理
                        let dim = obj.getBoundingRect();
                        totalObjHeight += dim.height;
                        let pos = 
                            value === 'top' 
                            ?
                            -(currentTarget.height/2 - dim.height/2)
                            :
                            value === 'bottom'
                            ?
                            currentTarget.height/2 - dim.height/2
                            :
                            0;
                        if ( value !== 'space' ) {
                            obj.set({ top:pos });
                            if ( obj.childNode ){
                                obj.childNode.set({ top:pos + dim.height / 2 + 10 })
                            }
                        }
                    });
                    if ( value === 'space' ) {
                        let objectArr = currentTarget._objects.filter(i=>i.type !== 'text' && i.type !== 'polyline').sort((a,b)=>a.top - b.top );
                        let spaceHeight = ( currentTarget.height - totalObjHeight ) / ( objectArr.length - 1 );
                        let sum = 0;
                        objectArr.forEach((obj,index)=>{
                            let dim = obj.getBoundingRect();
                            let offsetY = ( sum + index * spaceHeight + dim.height / 2 ) - currentTarget.height / 2;
                            sum += dim.height;
                            if ( index === 0 || index === objectArr.length - 1 ){
                                return ;
                            } else {
                                obj.set({
                                    // 不可交换，确保不改变之前的定位次序
                                    top:offsetY
                                });
                                if ( obj.childNode ) {
                                    obj.childNode.set({ top:offsetY + dim.height/2 + 10 });
                                }
                            }                        
                        })
                    }
                    canvas.renderAll();
                    setVerticalAlign(value);
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
    if ( prevProps.currentTarget !== nextProps.currentTarget || prevProps.selectedModels !== nextProps.selectedModels ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(SelectionAttrContainer, areEqual);

