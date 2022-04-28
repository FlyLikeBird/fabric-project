import React, { useEffect } from 'react';

function CanvasTest(){
    useEffect(()=>{
        let canvas = document.getElementById('my-canvas');
        let ctx = canvas.getContext('2d');
        console.log(ctx);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0,0,800,600);

        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "#00AAAA";
        ctx.lineWidth = 5;

        ctx.save();
        //平移至(300,200)
        // ctx.transform(1,0,0,1,300,200);
        //水平方向放大2倍，垂直方向放大1.5倍
        // ctx.transform(3,0,0, 2,0,0);
        //水平方向向右倾斜宽度10%的距离，垂直方向向上倾斜高度10%的距离
        // ctx.setTransform(1, 0, 0.2,1,0,0);
        ctx.fillRect(0,0,100,100);
        // ctx.strokeRect(0,0,100,100);
        console.log(ctx.getTransform());
        ctx.restore();
        console.log(ctx.getTransform());
        ctx.fillRect(0, 0, 100, 100);      
    },[])
    return (
        <div>
            <canvas id='my-canvas' width='800' height='600' style={{ border:'1px solid #ccc'}}></canvas>
        </div>
    )
}

export default CanvasTest;