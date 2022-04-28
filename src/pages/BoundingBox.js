import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import CatImg from '../../public/cat.svg';
console.log(CatImg);
function BoundingBox(){
    useEffect(()=>{
        let canvas = new fabric.Canvas('my-canvas');
        fabric.loadSVGFromURL(CatImg,(objects,options)=>{
            // console.log(objects);
            // console.log(options);
            var shape = fabric.util.groupSVGElements(objects, options);
            console.log(shape);
            // shape.on({
            //     'moving':()=>{
            //         console.log('moving');
            //         console.log(shape.aCoords);
            //         console.log(shape.calcTransformMatrix());
                    
            //     }
            // })
            canvas.add(shape);
            console.log(canvas);
            canvas.on('after:render',()=>{
                console.log('render');
                canvas.contextContainer.strokeStyle = '#555';
                // console.log(shape.getBoundingRect());
                // console.log(shape.calcTransformMatrix());
                let bound = shape.getBoundingRect();
                canvas.contextContainer.strokeRect(
                    bound.left, bound.top, bound.width, bound.height,
                    
                )
            })
            
        })
    },[])
    return (
        <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
    )
}

export default BoundingBox;