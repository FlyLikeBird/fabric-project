import React, { useEffect, useState } from 'react';
import { Button, Input, Select, message, Divider, Tag, Popover, InputNumber, Slider } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { updateTargetAttr, updateTextAttr, getBasicAttrs,  graphs, graphTypes, connectModels } from './util';
import style from './index.css';
const { Option } = Select;
let timer = null;
let posList = [{ title:'左侧', key:'left'}, { title:'顶部', key:'top'}, { title:'右侧', key:'right'}, { title:'底部', key:'bottom' }];

/*
    let selctedModel = {
        objId:obj
        flowOpts:{ entryDirec:'right', entryOffset:50, outputDirec:'left', outputOffset:50, pipeWidth:14, pipeColor:#cccccc, flowWidth:8, flowColor:#0000ff }
    }
*/
let defaultOpts = { entryDirec:'right', entryOffset:50, outputDirec:'left', outputOffset:50, pipeWidth:14, pipeColor:'#0c325a', flowWidth:6, flowColor:'#04a3fe' };
let isAll = false;
function BasicGraphAttrContainer({ canvas, currentTarget, attrInfo, allModels, machList, onChangeAttr }){
    let [selectedIds, setSelectedIds] = useState([]);
    let [optList, setOptList] = useState([]);
    let [machId, setMachId] = useState(0);
    let [visible, setVisible] = useState(false);
    let [labelVisible, setLabelVisible] = useState(false);
    useEffect(()=>{
        return ()=>{
            clearTimeout(timer);
            timer = null;
            isAll = false;
        }   
    },[]);
    useEffect(()=>{
        // 切换选中目标时，重置全选的状态
        isAll = false;
        setSelectedIds([]);
        if ( currentTarget ){
            onChangeAttr(getBasicAttrs(currentTarget));
            if ( currentTarget.machId ) {
                setMachId(currentTarget.machId);
            } else {
                setMachId(0);
            }
            let flowArr = currentTarget.flowArr || [];
            let modelList = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.objId !== currentTarget.objId);
            let temp = modelList.map(model=>{
                let result = flowArr.filter(i=>i.end === model.objId )[0];
                return result ? result.opts : { ...defaultOpts};
            });
            setOptList(temp);
        }
    },[currentTarget]);
    
    let selectedMachs = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.objId !== currentTarget.objId ).map(i=>i.machId);
    let handleOpts = (index, key, value )=>{
        let newArr = optList.map((item, j)=>{
            if ( index === j) {
                item[key] = value;
            } 
            return item;
        });
        setOptList(newArr);
    };
    let handleConnect = ( isDelete )=>{
        if ( selectedIds.length ){
            let flowArr = currentTarget.flowArr;
            selectedIds.forEach(id=>{
                let toTarget, index;
                allModels.forEach((model, i)=>{
                    if ( model.objId === id) {
                        toTarget = model;
                        index = i;
                    }
                })
                let result = flowArr && flowArr.length ? flowArr.filter(i=>i.end === id )[0] : null;
                let flowId = result ? result.objId : null
                connectModels(canvas, currentTarget, toTarget, optList[index], flowId, isDelete );
            });
            setSelectedIds([...selectedIds]);
        } else {
            message.info('请选择要连接或断开的对象')
        }
    }
    return (
        <div className={style['attr-container']}>
            {/* 绑定数据源 */}
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>绑定电表:</span>
                <div className={style['attr-item-control']} style={{ display:'inline-flex' }}>
                    <Select value={machId} onChange={value=>{
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
                <span className={style['attr-item-label']}>连接至:</span>
                <div className={style['attr-item-control']}>
                    <Button type='primary' onClick={()=>setVisible(true)} style={{ width:'100%' }}>选择对象</Button>
                    <div className={style['attr-modal']} style={{ display:visible ? 'block' : 'none' }} >
                        <div className={style['attr-modal-content']}>
                            {
                                allModels.length 
                                ?
                                <div className={style['list-container']}>
                                    {
                                        allModels.map((obj,index)=>{
                                            let isSelected = selectedIds.includes(obj.objId) ? true : false;
                                            let isConnect = false;
                                            let opts = optList[index] || {};
                                            if ( currentTarget && currentTarget.flowArr ) {
                                                let result = currentTarget.flowArr.filter(item=>item.end === obj.objId)[0];
                                                if ( result ) isConnect = true;
                                            }
                                            return (
                                            <div className={style['list-item-wrapper']} key={obj.objId}>
                                                <div className={style['list-item'] + ' ' + (isSelected ? style['selected'] : '') }>
                                                    <div className={style['list-item-content']} onClick={()=>{
                                                        let newArr = [...selectedIds];
                                                        if ( !selectedIds.includes(obj.objId)) {
                                                            newArr.push(obj.objId);
                                                        } else {
                                                            newArr = newArr.filter(i=>i !== obj.objId );
                                                        }
                                                        setSelectedIds(newArr);
                                                    }}>
                                                        <div style={{ fontWeight:'bold' }}><CheckCircleFilled style={{ marginRight:'4px', fontSize:'1.2rem', color: isSelected ? '#1890ff' : '#d3d3d3' }} />{ obj.childNode.text }</div>
                                                        <div><span className={style['tag']} style={{ background:isConnect ? '#87d068' : '#cccccc' }}>{ isConnect ? '已连接' : '未连接' }</span></div>
                                                    </div>
                                                    <div className={style['list-item-extra']}>
                                                        {/* 连接方向 */}
                                                        <div className={style['attr-item-wrapper']}>
                                                            <div className={style['attr-item-label']}>连接方向:</div>
                                                            <div className={style['attr-item-control']}>
                                                                <div style={{ width:'30%'}}>
                                                                    <Select size='small' disabled={ isSelected ? false : true } value={opts.entryDirec} onChange={value=>handleOpts(index, 'entryDirec', value)}>
                                                                        {
                                                                            posList.map((item)=>(
                                                                                <Option key={item.key} value={item.key}>{ item.title }</Option>
                                                                            ))
                                                                        }
                                                                    </Select>
                                                                </div>
                                                                <div style={{ width:'20%' }}><InputNumber  disabled={ isSelected ? false : true } size='small' min={0} max={100} value={opts.entryOffset} onChange={value=>handleOpts(index, 'entryOffset', value)} /></div>
                                                                <div style={{ width:'30%'}}>
                                                                    <Select size='small' disabled={ isSelected ? false : true } value={opts.outputDirec} onChange={value=>handleOpts(index, 'outputDirec', value)}>
                                                                        {
                                                                            posList.map((item)=>(
                                                                                <Option key={item.key} value={item.key}>{ item.title }</Option>
                                                                            ))
                                                                        }
                                                                    </Select>
                                                                </div>
                                                                <div style={{ width:'20%' }}><InputNumber  disabled={ isSelected ? false : true } size='small' min={0} max={100} value={opts.outputOffset} onChange={value=>handleOpts(index, 'outputOffset', value)} /></div>
                                                            </div>
                                                        </div>
                                                        {/* 管道设置 */}
                                                        <div className={style['attr-item-wrapper']}>
                                                            <div className={style['attr-item-label']}>管道宽度:</div>
                                                            <div className={style['attr-item-control']}>
                                                                <div style={{ width:'30%' }}>
                                                                    <InputNumber size='small' disabled={ isSelected ? false : true } min={0} max={30} value={opts.pipeWidth} onChange={value=>handleOpts(index, 'pipeWidth', value)} />
                                                                </div>
                                                                <div style={{ width:'20%' }}>
                                                                    <input type='color' disabled={ isSelected ? false : true } className={style['attr-input']} value={opts.pipeColor} onChange={value=>handleOpts(index, 'pipeColor', value)}/>
                                                                </div>
                                                                <div style={{ width:'30%' }}>
                                                                    <InputNumber size='small' disabled={ isSelected ? false : true } min={0} max={30} value={opts.flowWidth} onChange={value=>handleOpts(index, 'flowWidth', value)}/>
                                                                </div>
                                                                <div style={{ width:'20%' }}>
                                                                    <input type='color' disabled={ isSelected ? false : true } className={style['attr-input']} value={opts.flowColor} onChange={value=>handleOpts(index, 'flowColor', value)} />
                                                                </div>
                                                            </div>
                                                        </div>                                             
                                                    </div>
                                                </div>
                                            </div>)
                                        })
                                    }
                                </div>
                                :
                                <div>没有可连接的对象</div>
                            }
                        </div>
                        <div className={style['attr-modal-footer']}>
                            <div>
                                <Button style={{ marginRight:'6px' }} onClick={()=>{
                                    if ( !isAll ){
                                        let temp = allModels.map(i=>{
                                            return i.objId;
                                        });
                                        setSelectedIds(temp);
                                    } else {
                                        setSelectedIds([]);
                                    }
                                    isAll = !isAll;
                                }}>全选</Button>
                                <Button type='primary' style={{ marginRight:'6px' }} onClick={()=>handleConnect(false)}>连接</Button>
                                <Button onClick={()=>handleConnect(true)}>断开</Button> 
                            </div>
                            <Button onClick={()=>{ setVisible(false); setSelectedIds([]) }}>关闭</Button>                        
                        </div>
                    </div>
                </div>
                
                  
            </div>
            {/* <div className={style['attr-item-wrapper']}>
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
            </div> */}
            {/* <div className={style['attr-item-wrapper']}>
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
            </div> */}
            <div className={style['attr-item-wrapper']}>
                <span className={style['attr-item-label']}>模型标题:</span>
                <div className={style['attr-item-control']}>
                    <Input value={attrInfo.text} className={style['attr-input']}  onChange={e=>{
                        onChangeAttr({ ...attrInfo, text:e.target.value });
                        clearTimeout(timer);
                        timer = setTimeout(()=>{
                            updateTextAttr(canvas, currentTarget, 'text', e.target.value)
                        },500)
                    }} />  
                </div>
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>标题样式:</span>
                <div className={style['attr-item-control']}>
                    <div className={style['attr-item-control-content']}>
                        <InputNumber min={6} max={30} value={attrInfo.fontSize} className={style['attr-input']}  onChange={value=>{
                            onChangeAttr({ ...attrInfo, fontSize:value });
                            clearTimeout(timer);
                            timer = setTimeout(()=>{
                                updateTextAttr(canvas, currentTarget, 'fontSize', Number(value))
                            },500)
                        }} /> 
                    </div>
                    <div className={style['attr-item-control-content']}>
                        <input type='color' value={attrInfo.fontColor} className={style['attr-input']} onChange={e=>{
                            onChangeAttr({ ...attrInfo, fontColor:e.target.value });
                            updateTextAttr(canvas, currentTarget, 'fontColor', e.target.value);                 
                        }} />
                    </div>
                </div>                 
            </div>
           
            {
                currentTarget.type !== 'image' 
                ?
                <div className={style['attr-item-wrapper']}>
                    <span className={style['label']}>填充颜色:</span>
                    <div className={style['attr-item-control']}>
                        <input type='color' value={attrInfo.fill} className={style['attr-input']} onChange={e=>{
                            onChangeAttr({ ...attrInfo, fill:e.target.value });
                            updateTargetAttr(canvas, currentTarget, 'fill', e.target.value);                 
                        }} />
                    </div>        
                </div>
                :
                null
            }
            {
                currentTarget.type !== 'image'
                ?
                <div className={style['attr-item-wrapper']}>
                    <span className={style['label']}>描边颜色:</span>
                    <div className={style['attr-item-control']}>
                        <input type='color' value={attrInfo.stroke} className={style['attr-input']} onChange={e=>{
                            onChangeAttr({ ...attrInfo, stroke:e.target.value });
                            updateTargetAttr(canvas, currentTarget, 'stroke', e.target.value );
                        }} />
                    </div>                    
                </div>
                :
                null
            }
            {
                currentTarget.type !== 'image' 
                ?
                <div className={style['attr-item-wrapper']}>
                    <span className={style['label']}>描边宽度:</span>
                    <div className={style['attr-item-control']}>
                        <input type='range' min={0} max={10} value={attrInfo.strokeWidth} className={style['attr-input']} onChange={e=>{
                            onChangeAttr({ ...attrInfo, strokeWidth:e.target.value });
                            updateTargetAttr(canvas, currentTarget, 'strokeWidth', Number(e.target.value) );
                        }} />
                    </div>    
                </div>
                :
                null
            }
            {
                currentTarget && currentTarget.type
                ?           
                graphs.filter(i=>i.type.toLowerCase() === currentTarget.type )[0].attrs.map(attr=>{
                    return (<div className={style['attr-item-wrapper']} key={attr.attrKey}>
                        <span className={style['label']}>{ attr.attrName }:</span>
                        <div className={style['attr-item-control']}>
                            <Input value={attrInfo[attr.attrKey]} className={style['attr-input']}  onChange={e=>{
                                onChangeAttr({ ...attrInfo, [attr.attrKey]:e.target.value });
                                clearTimeout(timer);
                                timer = setTimeout(()=>{
                                    updateTargetAttr(canvas, currentTarget, attr.attrKey, Number(e.target.value))
                                },500);
                            }} />
                        </div>          
                    </div>)
                })
                :
                null
            }
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>X轴缩放:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={5} value={attrInfo.scaleX} step={0.1} onChange={value=>{
                        onChangeAttr({ ...attrInfo, scaleX:value });
                        updateTargetAttr(canvas, currentTarget, 'scaleX', value)
                    }}/>
                </div>            
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>Y轴缩放:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={5} value={attrInfo.scaleY} step={0.1} onChange={value=>{
                        onChangeAttr({ ...attrInfo, scaleY:value });
                        updateTargetAttr(canvas, currentTarget, 'scaleY', value)
                    }}/>
                </div>                  
            </div>
            
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>旋转角度:</span>
                <div className={style['attr-item-control']}>
                    <Slider min={0} max={360} value={attrInfo.angle} onChange={value=>{
                        onChangeAttr({ ...attrInfo, angle:value });
                        updateTargetAttr(canvas, currentTarget, 'angle', value)
                    }}/>
                </div>                 
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>添加标注</span>
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentTarget !== nextProps.currentTarget 
        || prevProps.attrInfo !== nextProps.attrInfo 
        || prevProps.allModels !== nextProps.allModels 
        || prevProps.machList !== nextProps.machList
    ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(BasicGraphAttrContainer, areEqual);

