import React, { useEffect } from 'react';
import { fabric } from './fabric';
let canvas = null;
let add = null;
function AnimatedSprite(){
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas');
        fabric.Object.prototype.transparentCorners = false;
        var minScale = 1, maxScale = 2;
        let rect = new fabric.Rect({
            left:100,
            top:100,
            width:200,
            height:100,
            fill:'#ccc'
        });
        canvas.add(rect);
        rect.animate({ angle: 30 }, {
            duration: 4000,
            easing: fabric.util.ease.easeOutCubic,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function onComplete() {
                // console.log('end');
                // console.log(rect.angle);
                rect.animate({
                  angle: Math.round(rect.angle) === 30 ? 0 : 30
                }, {
                  duration: 2000,
                  onChange: canvas.renderAll.bind(canvas),
                  onComplete: onComplete
                });
            }
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

export default AnimatedSprite;