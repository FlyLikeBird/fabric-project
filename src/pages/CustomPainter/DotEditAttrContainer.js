import React from 'react';
import { Button } from 'antd';
import { fabric } from 'fabric';

function DotEditAttrContainer({ currentTarget, editing, onEdit }){
    return (
        <div>
            <Button type='primary' onClick={()=>{
                onEdit(!editing);
                if ( currentTarget ){
                    currentTarget.hasBorders = !editing ? false : true;
                    currentTarget.transparentCorners = false;
                    if ( !editing ){
                        currentTarget.cornerStyle = 'circle';
                        currentTarget.cornerColor = 'rgba(0,0,255,0.5)';
                        currentTarget.controls = currentTarget.points.reduce(function(acc, point, index) {
                            acc['p' + index] = new fabric.Control({
                                positionHandler:handlePosition,
                                actionHandler:handleAction,
                                actionName: 'modifyPolygon',
                                pointIndex: index
                            });
                            return acc;
                        }, { });
                    } else {
                        // currentTarget
                        currentTarget.cornerColor = 'blue';
                        currentTarget.cornerStyle = 'rect';
                        console.log(currentTarget.getBoundingRect(currentTarget.points, true));
                        let center = currentTarget.getCenterPoint();
                        // currentTarget.points.forEach(point=>{
                        //     let x = point.x - center.x, y = point.y - center.y;
                           
                        //     console.log(fabric.util.transformPoint({ x, y }, currentTarget.calcTransformMatrix()))
                        // })
                        currentTarget.controls = fabric.Object.prototype.controls;
                    }
                }
            }}>{ editing ? '取消编辑' : '编辑' }</Button>
        </div>
    )
}

export default DotEditAttrContainer;

