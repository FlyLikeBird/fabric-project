import React, { useEffect } from 'react';
import { fabric } from './fabric';

let add = null;
let addClipPath = null;
let canvas = null;
function RectObj(){
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas');
        // create a rect object
      var deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
    
      var img = document.createElement('img');
      img.src = deleteIcon;
        
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = 'blue';
      fabric.Object.prototype.cornerStyle = 'circle';
        let points = [
            { x:50, y:50 },
            { x:100, y:50 },
            { x:100, y:200 },
            { x:50, y: 200}
        ];
      add = ()=>{
        var rect = new fabric.Polygon(points, {
          left: 200,
          top: 50,
          fill: 'yellow',
          objectCaching: false,
          stroke: 'lightgreen',
          strokeWidth: 2,
        });
        console.log(rect);
        canvas.add(rect);
        console.log(rect.calcTransformMatrix());
        canvas.setActiveObject(rect);
        rect.on('modified',()=>{
            console.log(rect);
        })
      }
      addClipPath = ()=>{
        
        canvas.controlsAboveOverlay = true;
            var clipPath = new fabric.Rect({ width: 100, height: 100, top: 0, left: 0 });
            function animateLeft() {
              clipPath.animate({
                left: 200,
              }, {
                duration: 900,
                onChange: canvas.requestRenderAll.bind(canvas),
                onComplete: animateRight,
              });
            }
            function animateRight() {
              clipPath.animate({
                left: 0,
              }, {
                duration: 1200,
                onChange: canvas.requestRenderAll.bind(canvas),
                onComplete: animateLeft,
              });
            }
            function animateDown() {
              clipPath.animate({
                top: 100,
              }, {
                duration: 500,
                onChange: canvas.requestRenderAll.bind(canvas),
                onComplete: animateUp,
              });
            }
            function animateUp() {
              clipPath.animate({
                top: 0,
              }, {
                duration: 400,
                onChange: canvas.requestRenderAll.bind(canvas),
                onComplete: animateDown,
              });
            }
            var group = new fabric.Group([
              new fabric.Rect({ width: 100, height: 100, fill: 'red' }),
              new fabric.Rect({ width: 100, height: 100, fill: 'yellow', left: 100 }),
              new fabric.Rect({ width: 100, height: 100, fill: 'blue', top: 100 }),
              new fabric.Rect({ width: 100, height: 100, fill: 'green', left: 100, top: 100 })
            ], {
            //   scaleX: 1.5
            });
            animateLeft();
            animateDown();
            canvas.clipPath = clipPath;
            // 裁切路径只能以图形对象的中心点来定位
            canvas.add(group);
      }
      fabric.Object.prototype.controls.deleteControl = new fabric.Control({
        x: 0,
        y: 0.5,
        // offsetY: 16,
        cursorStyle: 'pointer',
        mouseUpHandler: deleteObject,
        render: renderIcon,
        cornerSize: 14
      });
    
      
    
      function deleteObject(eventData, transform) {
            var target = transform.target;
            var canvas = target.canvas;
                canvas.remove(target);
            canvas.requestRenderAll();
        }
    
      function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        var size = this.cornerSize;
        // console.log(left,top);
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(img, -size/2, -size/2, size, size);
        ctx.restore();
      }
    },[])
    return (
        <div>
            <button onClick={()=>add()}>添加</button>
            <button onClick={()=>{
                let object = canvas.getObjects()[0];
                let newPoints = [...object.points];
                newPoints[3] = { x:-100, y:400 };
                object.set('points', newPoints);
                let prevPos = fabric.util.transformPoint({
                    x:newPoints[2].x - object.pathOffset.x ,
                    y:newPoints[2].y - object.pathOffset.y
                }, object.calcTransformMatrix());
                object._setPositionDimensions({});
                let polygonBaseSize = object._getNonTransformedDimensions();
                let newX = ( newPoints[2].x - object.pathOffset.x ) / polygonBaseSize.x + 0.5;
                let newY = ( newPoints[2].y - object.pathOffset.y ) / polygonBaseSize.y + 0.5;  
                console.log(newX, newY);
                console.log(object);
                object.setPositionByOrigin(prevPos, newX, newY);
                canvas.renderAll();
            }}>改变点</button>
            <button onClick={()=>addClipPath()}>添加裁剪矩形</button>
            <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
        </div>
    )
}

export default RectObj;