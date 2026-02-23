import React, { useState, useEffect,useRef } from 'react'
import { motion, spring } from 'framer-motion'
import './App.css'

const initialMovies = [
  { id: 1, text: 'Avatar' },
  { id: 2, text: 'SpiderMan' },
  { id: 3, text: 'Batman' },
  { id: 4, text: 'Superman' },
  { id: 5, text: 'Harry Poter' },
  { id: 6, text: 'Terminator' },
  { id: 7, text: 'Alien' },
  { id: 8, text: 'Jura' }
];

export default function App() {
  const [movies, setMovies] = useState(initialMovies);
  const [draggingItemInfo, setDraggingItemInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef=useRef(null);
  const draggingItemInfoRef=useRef(null);
  draggingItemInfoRef.current=draggingItemInfo;
  let lock=useRef(null);

  const handleMouseDown=(e,movie)=>{
    const target=e.currentTarget;
    const rect=target.getBoundingClientRect();
    setMousePos({x:e.clientX,y:e.clientY});
    setDraggingItemInfo({
      id: movie.id,
      shiftX:e.clientX-rect.left,
      shiftY: e.clientY-rect.top,
      width: rect.width,
      height: rect.height,
      originalMovies:[...movies]
    })
  }

  useEffect(()=>{
    if(!draggingItemInfo) return;

    const handleMouseMove=(e)=>{
      setMousePos({x:e.clientX,y:e.clientY});
      // if(!containerRef.current) return;
      const containerRect=containerRef.current.getBoundingClientRect();
      const isOut=e.clientX<containerRect.left||e.clientX>containerRect.right||e.clientY<containerRect.top||e.clientY>containerRect.bottom;
      if(isOut){
        setMovies(draggingItemInfoRef.current.originalMovies);
        return;
      }
      if(lock.current) return;
      const elementBelow=document.elementFromPoint(e.clientX,e.clientY);
      const targetBelow=elementBelow?.closest('.flex-item');
      if(targetBelow){
        const targetId=Number(targetBelow.getAttribute('data-id'));
        const currentDragId=draggingItemInfoRef.current.id;
        if(targetId&&targetId!==currentDragId){
          setMovies((prev)=>{
            const oldIndex=prev.findIndex(m=>m.id===currentDragId);
            const newIndex=prev.findIndex(m=>m.id===targetId);
            const newArr=[...prev];
            const movedItem=newArr.splice(oldIndex,1)[0];
            newArr.splice(newIndex,0,movedItem);
            return newArr;
          })
        }
      }
      lock.current=true;
      setTimeout(()=>{
        lock.current=false;
      },100);
    }
    const handleMouseUp=()=>{
      setDraggingItemInfo(null);

    }

    window.addEventListener('mousemove',handleMouseMove);
    window.addEventListener('mouseup',handleMouseUp);
    return()=>{
      window.removeEventListener('mousemove',handleMouseMove);
      window.removeEventListener('mouseup',handleMouseUp);
    }
  },[draggingItemInfo]);


  return (
    <>
      <div className="container" ref={containerRef}>
        {movies.map((movie) => {
          const isDragging=draggingItemInfo?.id===movie.id;
          return (
            // <>
              <motion.div
                layout
                key={movie.id}
                className={
                  `flex-item 
                  item
                  ${isDragging?"placeholder":""}`
                }
                onMouseDown={(e)=>handleMouseDown(e,movie)}
                data-id={movie.id}
                transition={{type:"spring",stiffness:400,damping:50}}
              >
                {movie.text}
              </motion.div>
            // </>
          )
        })}
      </div>
      {draggingItemInfo&&(
        <div
          className='item dragging'
          style={{
            width: draggingItemInfo.width,
            height: draggingItemInfo.height,
            left: mousePos.x - draggingItemInfo.shiftX,
            top: mousePos.y - draggingItemInfo.shiftY
          }}
        >
          {movies.find(m=>m.id===draggingItemInfo.id)?.text}
        </div>
      )}
    </>
  )
}