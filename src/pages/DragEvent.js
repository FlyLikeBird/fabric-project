import React, { useEffect } from 'react';

let style = {
    width:'100px',
    height:'100px',
    backgroundColor:'#ccc'
}

function DragEvent(){
    useEffect(()=>{
        let sourceDom = document.getElementById('draggable');
        var targetDom = document.getElementById('target');
        document.addEventListener('dragstart',(e)=>{
            e.dataTransfer.setData('text/plain', JSON.stringify({ x:10, y:20, z:{ d:40 }}));
        })
        document.addEventListener('dragenter',(e)=>{
            console.log(e.target);
            console.log(e.dataTransfer.types);
        });
        document.addEventListener('dragover',(e)=>{
            e.preventDefault();
            console.log(e.dataTransfer.getData('text/plain'));
        });
        document.addEventListener('drop',e=>{
            console.log('drop');
            console.log(e.dataTransfer.types);
            let result = e.dataTransfer.getData('text/plain');
            console.log(result);
            console.log(JSON.parse(result));
        })
        // sourceDom.addEventListener('mousemove', (e)=>{
        //     console.log('mouse-move');
        // })
        // sourceDom.addEventListener('dragstart',(e)=>{
        //     console.log('drag-start');
        //     e.target.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';

        // });
        // sourceDom.addEventListener('dragend',()=>{
        //     console.log('drag-end');
        // });
        // sourceDom.addEventListener('dragenter',()=>{
        //     console.log('drag-enter');
        // });
        // sourceDom.addEventListener('dragover',()=>{
        //     console.log('drag-over');
        // });
        // sourceDom.addEventListener('dragleave',()=>{
        //     console.log('drag-leave');
        // });
        // targetDom.addEventListener('dragenter',(e)=>{
        //     console.log('target-drag-enter');
        // });
        // targetDom.addEventListener('dragover',(e)=>{
        //     console.log('target-drag-over');
        //     e.preventDefault();
        //     e.dataTransfer.dropEffect = 'copy';
        // });
        // targetDom.addEventListener('dragleave',()=>{
        //     console.log('target-drag-leave');
        // });
        // targetDom.addEventListener('drop',()=>{
        //     console.log('drop');
        // })
    },[])
    return (
        <div>
            <div id='draggable' draggable="true" style={style}></div>
            <div id='target' style={{ ...style, width:'400px', height:'400px' }}></div>
        </div>
    )
}

export default DragEvent;