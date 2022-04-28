import React, { useEffect } from 'react';
import { Radio } from 'antd';
import { ToTopOutlined } from '@ant-design/icons';
import { fabric } from './fabric';
import Img from '../../public/wxApp.jpg';

console.log(fabric);
let isPainting = false;
let polyLine = null;
let handleEdit = null;

function Container(){
    useEffect(()=>{
        var canvas = new fabric.Canvas('my-canvas',{
            backgroundColor:'#fefefe',
            selection:true,
        });
        document.onmousedown = e=>{
            if ( e.button === 2 ){
                isPainting = false;
                polyLine = null;
                if ( canvas ){
                    canvas.off('mouse:move');
                }
            }
        }
        // create a polygon object
        // var points = [{
        //     x: 3, y: 4
        // }, {
        //     x: 16, y: 3
        // }, {
        //     x: 30, y: 5
        // },  {
        //     x: 25, y: 55
        // }, {
        //     x: 19, y: 44
        // }, {
        //     x: 15, y: 30
        // }, {
        //     x: 15, y: 55
        // }, {
        //     x: 9, y: 55
        // }, {
        //     x: 6, y: 53
        // }, {
        //     x: -2, y: 55
        // }, {
        //     x: -4, y: 40
        // }, {
        //     x: 0, y: 20
        // }]
        var points = [{
            x: 50, y: 50
        }, {
            x: 500, y: 20
        }, {
            x: 200, y: 200
        },{
            x:100, y:300
        },{
            x: 50, y: 200
        }];
        
        var polygon = new fabric.Polygon(points, {
            // left: 100,
            // top: 50,
            fill: '#D81B60',
            strokeWidth: 2,
            stroke: 'green',
            // scaleX: 4,
            // scaleY: 4,
            objectCaching: false,
            transparentCorners: false,
            cornerColor: 'blue',
        });
        // canvas.viewportTransform = [0.7, 0, 0, 0.7, -50, 50];
        canvas.add(polygon);
    
        // define a function that can locate the controls.
        // this function will be used both for drawing and for interaction.
        function polygonPositionHandler(dim, finalMatrix, fabricObject) {
           
            if ( this.pointIndex === 0 ){
                // console.log(fabricObject);
                console.log(fabricObject.getCenterPoint());
                // console.log(fabricObject.calcTransformMatrix());
                // console.log(fabricObject.getLocalPointer());
                // console.log(dim);
                // console.log(finalMatrix);
                // console.log(fabricObject);
                // console.log(fabricObject.canvas.viewportTransform);
                // console.log(fabricObject.calcTransformMatrix() );
                //  初始化变换矩阵  [1, 0, 0, 1, 275, 170]
                // 旋转90°变换矩阵 
                // [-0.006142923152643049, 0.999981132069571, -0.999981132069571, -0.006142923152643049, 275, 169.9999999999996]
            }
            // console.log(fabric.util.multiplyTransformMatrices(fabricObject.canvas.viewportTransform, fabricObject.calcTransformMatrix()));
            // 经测试 生成一个图形对象时会默认有一个平移矩阵，平移到此图形对象的中心点
            // 故计算锚点时要先计算锚点和中心点的相对位置，才能保证图形变换时锚点跟随着变换
            // pathOffset表示图形对象中心点的相对坐标
            // fabricObject.pathOffset  x =（ points横向的最大值 - points横向最小值 ) / 2 + points横向最小值 
            
            var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
            y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
            var result = fabric.util.transformPoint(
                    { x,y },
              fabric.util.multiplyTransformMatrices(
                fabricObject.canvas.viewportTransform,
                fabricObject.calcTransformMatrix()
              )
            );
            // console.log(result);
            // return { x:fabricObject.points[this.pointIndex].x, y:fabricObject.points[this.pointIndex].y };
            return result;
        }
    
        // define a function that will define what the control does
        // this function will be called on every mouse move after a control has been
        // clicked and is being dragged.
        // The function receive as argument the mouse event, the current trasnform object
        // and the current position in canvas coordinate
        // transform.target is a reference to the current object being transformed,
        function actionHandler(eventData, transform, x, y) {
            var polygon = transform.target,
                currentControl = polygon.controls[polygon.__corner],
                mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
            // _getTransformedDimensions() 获取图像对象的控制区面积，返回{ x:--, y:-- }, 代表宽度和长度
            polygonBaseSize = polygon._getNonTransformedDimensions(),
                    size = polygon._getTransformedDimensions(0, 0),
                    finalPointPosition = {
                        x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                        y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
                    };
                   
            // console.log(x,y);
            // console.log(mouseLocalPosition);
            // console.log(polygonBaseSize);
            // console.log(size);
            // console.log(polygon);
            // console.log(finalPointPosition);
            polygon.points[currentControl.pointIndex] = finalPointPosition;
            
            // polygon.points[currentControl.pointIndex] = { x:mouseLocalPosition.x + polygon.pathOffset.x, y:mouseLocalPosition.y + polygon.pathOffset.y  };
            return true;
        }
    
      // define a function that can keep the polygon in the same position when we change its
      // width/height/top/left.
      function anchorWrapper(anchorIndex, fn) {
        return function(eventData, transform, x, y) {
            // console.log(x,y);
          var fabricObject = transform.target;
          console.log(anchorIndex);
          var    absolutePoint = fabric.util.transformPoint({
                  x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                  y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
              }, fabricObject.calcTransformMatrix());
              console.log(absolutePoint);
           var  actionPerformed = fn(eventData, transform, x, y);
                //  更改了多边形的点以后重新计算边界框
            var    newDim = fabricObject._setPositionDimensions({});
            var    polygonBaseSize = fabricObject._getNonTransformedDimensions();
            console.log(polygonBaseSize);
            var    newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x;
            var    newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
                console.log(newX, newY);
                fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
                console.log(fabricObject);
                console.log(fabricObject.calcTransformMatrix());
          return actionPerformed;
        }
      }
    
      handleEdit = ()=>{
        // clone what are you copying since you
        // may want copy and paste on different moment.
        // and you do not want the changes happened
        // later to reflect on the copy.
        var poly = canvas.getObjects()[0];
        canvas.setActiveObject(poly);
        poly.edit = !poly.edit;
        if (poly.edit) {
            var lastControl = poly.points.length - 1;
            poly.cornerStyle = 'circle';
            poly.cornerColor = 'rgba(0,0,255,0.5)';
            poly.controls = poly.points.reduce(function(acc, point, index) {
                // console.log(acc);
                // console.log(point);
                acc['p' + index] = new fabric.Control({
                    positionHandler: polygonPositionHandler,
                    actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
                    actionName: 'modifyPolygon',
                    pointIndex: index
                });
                return acc;
            }, { });
        } else {
          poly.cornerColor = 'blue';
          poly.cornerStyle = 'rect';
            console.log(fabric.Object.prototype.controls);
            poly.controls = fabric.Object.prototype.controls;
        }
        poly.hasBorders = !poly.edit;
        canvas.requestRenderAll();
        }
        console.log(polygon);
        console.log(polygon.calcTransformMatrix());
        polygon.on('modified',()=>{
            console.log('modify'); 
            console.log(polygon.aCoords);
            // console.log(polygon.getCenterPoint());
            // console.log(polygon.left, polygon.top, polygon.width, polygon.height);
            // console.log(polygon.points);
            // console.log(polygon.calcTransformMatrix());
        })
        
        // canvas.on('object:modified',()=>{
        //     console.log('modify');
        //     console.log(polygon);
        //     console.log(polygon.calcTransformMatrix());
        //     console.log(polygon.getCenterPoint());
            
        // })
        
    },[])
    return (
        <div>
            <div>
                <Radio.Group>
                    <Radio.Button><ToTopOutlined onClick={()=>{ isPainting = true }} /></Radio.Button>
                    <Radio.Button onClick={()=>handleEdit()}></Radio.Button>
                </Radio.Group>
            </div>
            <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
        </div>
    )
}

export default Container;