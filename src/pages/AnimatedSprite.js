import React, { useEffect } from 'react';
import { fabric } from './fabric';
import SpriteImg from '../../public/Sprite.png';
let canvas = null;
let add = null;
function AnimatedSprite(){
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas');
        fabric.Object.prototype.transparentCorners = false;
        console.log(fabric.Sprite);
        fabric.Image.fromURL(SpriteImg, createSprite(0, 0));
        function createSprite(i, j){
            return function(img){
                console.log(img);
                img.width = 50;
                canvas.add(img);
                
                console.log(img.calcTransformMatrix());

            }
        }
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