import React, { useEffect, useState } from 'react';
import { Button, Input, Select, message, Divider, Tag, Popover, InputNumber } from 'antd';
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

function BasicGraphAttrContainer({ canvas, currentTarget, attrInfo, allModels, machList, onChangeAttr }){
    let [selectedModels, setSelectedModels] = useState([]);
    let [machId, setMachId] = useState(0);
    let [visible, setVisible] = useState(false);
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
                let temp = currentTarget.flowArr.map(item=>{
                    return { objId:item.objId, opts:item.opts };
                });
                setSelectedModels(temp);
                
            } else {                
                
            }
        }
    },[currentTarget]);
    
    let selectedMachs = canvas.getObjects().filter(i=> graphTypes.includes(i.type) && i.objId !== currentTarget.objId ).map(i=>i.machId);
    let handleOpts = (objId, key, value )=>{
        let newArr = selectedModels.map(i=>{
            if ( i.objId === objId) {
                i.opts[key] = value;
            } 
            return i;
        });
        setSelectedModels(newArr);
    }
    let selctedIds = selectedModels.map(i=>i.objId);
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
                    <div className={style['attr-modal']} style={{ display:visible ? 'block' : 'none' }}>
                        <div className={style['attr-modal-content']}>
                            {
                                allModels.length 
                                ?
                                <div className={style['list-container']}>
                                    {
                                        allModels.map(obj=>{
                                            let isSelected = selctedIds.includes(obj.objId) ? true : false;
                                            let isConnect = false;
                                            let selectedObj = selectedModels.filter(i=>i.objId === obj.objId)[0];
                                            let opts = selectedObj ? selectedObj.opts : { ...defaultOpts };
                                            if ( currentTarget.flowArr && currentTarget.flowArr.length ){
                                                let flowObj = currentTarget.flowArr.filter(flow=>flow.end === obj.objId)[0];                                          
                                                if ( flowObj ) {
                                                    isConnect = true;
                                                    opts = flowObj.opts;
                                                }
                                            }
                                            return (
                                            <div className={style['list-item-wrapper']} key={obj.objId}>
                                                <div className={style['list-item'] + ' ' + (isSelected ? style['selected'] : '') }>
                                                    <div className={style['list-item-content']} onClick={()=>{
                                                        let newArr = [...selectedModels];
                                                        if ( !selctedIds.includes(obj.objId)) {
                                                            newArr.push({ objId:obj.objId, opts:{ ...defaultOpts}});
                                                        } else {
                                                            newArr = newArr.filter(i=>i.objId !== obj.objId );
                                                        }
                                                        setSelectedModels(newArr);
                                                    }}>
                                                        <div style={{ fontWeight:'bold' }}><CheckCircleFilled style={{ marginRight:'4px', fontSize:'1.2rem', color: isSelected ? '#1890ff' : '#d3d3d3' }} />{ obj.childNode.text }</div>
                                                        <div><Tag style={{ color:isConnect ? 'green' : '#ccc' }}>{ isConnect ? '已连接' : '未连接' }</Tag></div>
                                                    </div>
                                                    <div className={style['list-item-extra']}>
                                                        {/* 连接方向 */}
                                                        <div className={style['attr-item-wrapper']}>
                                                            <div className={style['attr-item-label']}>连接方向:</div>
                                                            <div className={style['attr-item-control']}>
                                                                <div style={{ width:'30%'}}>
                                                                    <Select size='small' disabled={ isSelected ? false : true } value={opts.entryDirec} onChange={value=>handleOpts(obj.objId, 'entryDirec', value)}>
                                                                        {
                                                                            posList.map((item)=>(
                                                                                <Option key={item.key} value={item.key}>{ item.title }</Option>
                                                                            ))
                                                                        }
                                                                    </Select>
                                                                </div>
                                                                <div style={{ width:'20%' }}><InputNumber  disabled={ isSelected ? false : true } size='small' min={0} max={100} value={opts.entryOffset} onChange={value=>handleOpts(obj.objId, 'entryOffset', value)} /></div>
                                                                <div style={{ width:'30%'}}>
                                                                    <Select size='small' disabled={ isSelected ? false : true } value={opts.outputDirec} onChange={value=>handleOpts(obj.objId, 'outputDirec', value)}>
                                                                        {
                                                                            posList.map((item)=>(
                                                                                <Option key={item.key} value={item.key}>{ item.title }</Option>
                                                                            ))
                                                                        }
                                                                    </Select>
                                                                </div>
                                                                <div style={{ width:'20%' }}><InputNumber  disabled={ isSelected ? false : true } size='small' min={0} max={100} value={opts.outputOffset} onChange={value=>handleOpts(obj.objId, 'outputOffset', value)} /></div>
                                                            </div>
                                                        </div>
                                                        {/* 管道设置 */}
                                                        <div className={style['attr-item-wrapper']}>
                                                            <div className={style['attr-item-label']}>管道宽度:</div>
                                                            <div className={style['attr-item-control']}>
                                                                <div style={{ width:'30%' }}>
                                                                    <InputNumber size='small' disabled={ isSelected ? false : true } min={0} max={30} value={opts.pipeWidth} onChange={value=>handleOpts(obj.objId, 'pipeWidth', value)} />
                                                                </div>
                                                                <div style={{ width:'20%' }}>
                                                                    <input type='color' disabled={ isSelected ? false : true } className={style['attr-input']} value={opts.pipeColor} onChange={value=>handleOpts(obj.objId, 'pipeColor', value)}/>
                                                                </div>
                                                                <div style={{ width:'30%' }}>
                                                                    <InputNumber size='small' disabled={ isSelected ? false : true } min={0} max={30} value={opts.flowWidth} onChange={value=>handleOpts(obj.objId, 'flowWidth', value)}/>
                                                                </div>
                                                                <div style={{ width:'20%' }}>
                                                                    <input type='color' disabled={ isSelected ? false : true } className={style['attr-input']} value={opts.flowColor} onChange={value=>handleOpts(obj.objId, 'flowColor', value)} />
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
                                <div>hello</div>
                            }
                        </div>
                        <div className={style['attr-modal-footer']}>
                            <Button type='primary' style={{ marginRight:'6px' }} onClick={()=>{
                                if ( selectedModels.length ){
                                    let flowArr = currentTarget.flowArr;
                                    selectedModels.forEach(item=>{
                                        let toTarget = allModels.filter(i=>i.objId === item.objId )[0];
                                        let result = flowArr && flowArr.length ? flowArr.filter(i=>i.end === item.objId )[0] : null;
                                        let flowId = result ? result.objId : null
                                        connectModels(canvas, currentTarget, toTarget, item.opts, flowId );
                                    });
                                    setSelectedModels([...selectedModels]); 
                                } else {
                                    message.info('请选择要连接或断开的对象')
                                }
                            }}>连接</Button>
                            <Button>断开</Button>
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
                <span className={style['label']}>标题大小:</span>
                <div className={style['attr-item-control']}>
                    <Input value={attrInfo.fontSize} className={style['attr-input']}  onChange={e=>{
                        onChangeAttr({ ...attrInfo, fontSize:e.target.value });
                        clearTimeout(timer);
                        timer = setTimeout(()=>{
                            updateTextAttr(canvas, currentTarget, 'fontSize', Number(e.target.value))
                        },500)
                    }} /> 
                </div>                 
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>标题颜色:</span>
                <div className={style['attr-item-control']}>
                    <input type='color' value={attrInfo.fontColor} className={style['attr-input']} onChange={e=>{
                        onChangeAttr({ ...attrInfo, fontColor:e.target.value });
                        updateTextAttr(canvas, currentTarget, 'fontColor', e.target.value);                 
                    }} />
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
                    <Input value={attrInfo.scaleX} className={style['attr-input']}  onChange={e=>{
                        onChangeAttr({ ...attrInfo, scaleX:e.target.value });
                        clearTimeout(timer);
                        timer = setTimeout(()=>{
                            updateTargetAttr(canvas, currentTarget, 'scaleX', Number(e.target.value))
                        },500)
                    }} />
                </div>            
            </div>
            <div className={style['attr-item-wrapper']}>
                <span className={style['label']}>Y轴缩放:</span>
                <div className={style['attr-item-control']}>
                    <Input value={attrInfo.scaleY} className={style['attr-input']}  onChange={e=>{
                        onChangeAttr({ ...attrInfo, scaleY:e.target.value });
                        clearTimeout(timer);
                        timer = setTimeout(()=>{
                            updateTargetAttr(canvas, currentTarget, 'scaleY', Number(e.target.value))
                        },500)
                    }} />
                </div>                  
            </div>
            {
                currentTarget.type !== 'image'
                ?
                <div className={style['attr-item-wrapper']}>
                    <span className={style['label']}>旋转角度:</span>
                    <div className={style['attr-item-control']}>
                        <Input value={attrInfo.angle} className={style['attr-input']}  onChange={e=>{
                            onChangeAttr({ ...attrInfo, angle:e.target.value });
                            clearTimeout(timer);
                            timer = setTimeout(()=>{
                                updateTargetAttr(canvas, currentTarget, 'angle', Number(e.target.value))
                            },500)
                        }} />
                    </div>                 
                </div>
                :
                null
            }
            {/* <Button type='primary' style={{ margin:'1rem ' }} danger onClick={()=>{
                if ( currentTarget.flowArr ) {
                    let flowObj = currentTarget.flowArr[0];
                    flowObj.set({ stroke:'#ff0000'});
                    canvas.renderAll();
                }
            }}>模拟告警信息</Button> */}
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

