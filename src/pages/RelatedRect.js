import React, { useEffect } from 'react';
import { Radio } from 'antd';
import { ToTopOutlined } from '@ant-design/icons';
import { fabric } from 'fabric';
import { wrapperEvents } from './CustomPainter/util';
import Img from '../../public/wxApp.jpg';

let isPainting = false;
let polyLine = null;
let handleEdit = null;
let canvas = null;
let index = 0;
function Container(){
    useEffect(()=>{
        canvas = new fabric.Canvas('my-canvas',{
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
        let colors = ['red', 'green', 'blue'];
        handleEdit = ()=>{
            var textObj = new fabric.Text('hello world' + index, { fontSize:14, selected:false });
            console.log(textObj);
            textObj.set({
                left:300 - textObj.width/2,
                top:300 + 50 + 10
            });
            var rect = new fabric.Rect({
                left:300,
                top:300,
                fill:colors[index],
                width:200,
                height:100,
                originX:'center',
                originY:'center',
                childNode:textObj
            });
            canvas.add(rect);
            canvas.add(textObj);

            wrapperEvents(rect);
            index++;
        }
        
        
    },[])
    return (
        <div>
            <div>
                <Radio.Group>
                    <Radio.Button><ToTopOutlined onClick={()=>{ isPainting = true }} /></Radio.Button>
                    <Radio.Button onClick={()=>handleEdit()}>添加矩形</Radio.Button>
                    <Radio.Button onClick={()=>{
                        console.log(canvas.getObjects());
                        let bottomObj = canvas.getObjects()[0];
                        console.log(bottomObj);
                        bottomObj.bringToFront();
                        console.log(canvas.getObjects());
                        // canvas.bringToFront(bottomObj);
                    }}>切换层级</Radio.Button>
                </Radio.Group>
            </div>
            <canvas id='my-canvas' width='1000px' height='600px' style={{ border:'1px solid #000'}}>container</canvas>
        </div>
    )
}

export default Container;