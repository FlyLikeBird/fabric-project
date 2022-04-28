import React, { useEffect } from 'react';
import { fabric } from './fabric';
import SpriteImg from '../../public/Sprite.png';
let canvas = null;
let add = null;
let activeObj = null;
let clickX = 0, clickY = 0;

function CopyAndPaste(){
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas');
        fabric.Object.prototype.transparentCorners = false;
        var rect = new fabric.Rect({
            left: 100,
            top: 50,
            fill: '#D81B60',
            width: 100,
            height: 100,
            strokeWidth: 2,
            stroke: "#880E4F",
            angle: 45,
        });
        var rect2 = new fabric.Rect({
            left: 200,
            top: 50,
            fill: '#F06292',
            width: 100,
            height: 100,
            strokeWidth: 2,
            stroke: "#880E4F",
            angle: 45,
        });
        canvas.add(rect);
        canvas.add(rect2);
        canvas.on('mouse:down',(option)=>{
            let { e, target } = option;
            if ( target ){
                if ( e.altKey ){
                    // canvas.discardActiveObject();
                    target.lockMovementX = true;
                    target.lockMovementY = true;  
                    clickX = e.clientX;
                    clickY = e.clientY;    
                    if ( target.type === 'activeSelection' ) {
                        let children = [];
                        target.forEachObject(obj=>{
                            obj.clone((clonedObj)=>{
                                canvas.add(clonedObj);
                                children.push(clonedObj);
                            })
                        });
                        
                        activeObj = new fabric.ActiveSelection(children, { left:target.left, top:target.top });
                        activeObj.canvas = canvas;              
                        activeObj.initLeft = activeObj.left ;
                        activeObj.initTop = activeObj.top;
                        canvas.setActiveObject(activeObj);
                    } else {
                        target.clone((clonedObj)=>{
                            activeObj = clonedObj;
                            activeObj.opacity = 0.5;
                            activeObj.lockMovementX = false;
                            activeObj.lockMovementY = false;
                            activeObj.initLeft = activeObj.left;
                            activeObj.initTop = activeObj.top;
                            canvas.add(activeObj);
                            canvas.setActiveObject(activeObj);
                        });
                    }
                } else {
                    target.lockMovementX = false;
                    target.lockMovementY = false;
                }
            }
        });
        canvas.on('mouse:move',option=>{
            if ( activeObj ){
                let { e } = option;
                let offsetX = e.clientX - clickX;
                let offsetY = e.clientY - clickY;
                activeObj.set({
                    left:activeObj.initLeft + offsetX,
                    top:activeObj.initTop + offsetY,
                    fill:'blue'
                });
                canvas.renderAll();
            }
        })
        canvas.on('mouse:up',()=>{
            console.log('mouse:up');
            if ( activeObj ){
                activeObj.opacity = 1;
                canvas.renderAll();
            }
            activeObj = null;
        });
        
    },[])
    return (
        <div>
            <button onClick={()=>{
                let img = canvas.getObjects()[0];
                img.set('cropX',100);
                canvas.renderAll();
                render();
                let i = 0;
                function render(){
                    setInterval(()=>{
                        img.set('cropX', i );
                        i += 50;
                        if ( i===500) {
                            i = 0;
                        }
                        canvas.renderAll();
                    }, 100)
                }
                
                
            }}>开启Animate</button>
            <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
        </div>
    )
}

export default CopyAndPaste;