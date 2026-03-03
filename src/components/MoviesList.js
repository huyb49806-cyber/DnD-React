import { useState, useEffect, useRef, useCallback } from 'react'
import "../App.css";
import Item from "./Item";

const initialMovies = [
    { id: 100, text: 'Avatar' },
    { id: 101, text: 'SpiderMan' },
    { id: 102, text: 'Batman' },
    { id: 103, text: 'Superman' },
    { id: 104, text: 'Harry Poter' },
    { id: 105, text: 'Terminator' },
    { id: 106, text: 'Alien' },
    { id: 107, text: 'Jura' }
];

export default function MoviesList() {
    console.log(1);
    const [movies, setMovies] = useState(initialMovies);
    const [dragging,setDragging]=useState(false);

    const draggingInfoRef = useRef(null);
    const draggingItemRef=useRef(null);
    const containerRef = useRef(null);
    const setPos = (e) => {
        const draggingItemRect=draggingItemRef.current;
        draggingItemRect.style.left = e.clientX - draggingInfoRef.current.shiftX+'px';
        draggingItemRect.style.top = e.clientY - draggingInfoRef.current.shiftY+'px';
    }

    const handleMouseMove = useRef( (e) => {
        
        if (!draggingInfoRef.current) return;
        setPos(e);
        const containerRect = containerRef.current.getBoundingClientRect();
        const isOut = e.clientX < containerRect.left || e.clientX > containerRect.right || e.clientY < containerRect.top || e.clientY > containerRect.bottom;
        let {currentIdOrder, prevIdOrder,originalIdOrder, moviesRect}=draggingInfoRef.current;
        if (isOut) {
            currentIdOrder=[...originalIdOrder];
        }
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        const targetBelow = elementBelow?.closest('.flex-item');
        if (targetBelow) {
            prevIdOrder=[...currentIdOrder];
            const targetId = Number(targetBelow.getAttribute('data-id'));//getAttri tra ve string
            const draggingItemId = draggingInfoRef.current.id;
            if (targetId !== draggingItemId) {
                console.log(3);
                const newIdOrder=[...currentIdOrder];
                const targetMovieIdx=newIdOrder.findIndex(id=>id===targetId);
                const draggingMovieIdx=newIdOrder.findIndex(id=>id===draggingInfoRef.current.id);
                const deletedIdMovie=newIdOrder.splice(draggingMovieIdx,1)[0];
                newIdOrder.splice(targetMovieIdx,0,deletedIdMovie);
                currentIdOrder=newIdOrder;
            }
        }
        draggingInfoRef.current.currentIdOrder=currentIdOrder;
        draggingInfoRef.current.prevIdOrder=prevIdOrder;

        const domNodes=Array.from(containerRef.current.children);
        domNodes.forEach((domNode)=>{      //key laf id
            const key=Number(domNode.getAttribute('data-id'));
            if(key===draggingInfoRef.current.id) return;
            const originalIdx=originalIdOrder.indexOf(key);
            const prevIdx=prevIdOrder.indexOf(key);
            const currentIdx=currentIdOrder.indexOf(key);
            if(originalIdx!==currentIdx){
                const prevRect=moviesRect[prevIdx];
                const currentRect=moviesRect[currentIdx];
                const dx=currentRect.left-prevRect.left;
                const dy=currentRect.top-prevRect.top;
                domNode.style.transform=`translate(${dx}px,${dy}px)`;
            }
            else{
                domNode.style.transform=``;
            }
        })
    })

    const handleMouseUp = useRef(() => {
        const {currentIdOrder,prevIdOrder,originalIdOrder}=draggingInfoRef.current;
        const isChange1=originalIdOrder.some((id,idx)=>id!==currentIdOrder[idx]);
        const isChange2=prevIdOrder.some((id,idx)=>id!==currentIdOrder[idx]);
        draggingInfoRef.current = null;
        setDragging(false);
        document.removeEventListener('mousemove', handleMouseMove.current);
        document.removeEventListener('mouseup', handleMouseUp.current);

        const domNodes = Array.from(containerRef.current.children);
        domNodes.forEach(domNode=>{
            domNode.style.transform='';
            domNode.style.transition='none';
            domNode.style.transition='';
        })
        if(isChange1&&isChange2){
            setMovies(prev=>{
                const currentOrder=new Map(currentIdOrder.map((id,idx)=>[id,idx]));
                return [...prev].sort((a,b)=>currentOrder.get(a.id)-currentOrder.get(b.id));
            })
        }
    })

    const handleMouseDown = useCallback((e, movie) => {
        console.log(5);
        setDragging(true);
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const originalIdOrder=movies.map(movie=>movie.id);
        const moviesRect=originalIdOrder.map(id=>{
            const node=containerRef.current.querySelector(`[data-id="${id}"]`);
            return node.getBoundingClientRect();
        })
        draggingInfoRef.current = {
            id: movie.id,
            shiftX: e.clientX - rect.left,
            shiftY: e.clientY - rect.top,
            width: rect.width,
            height: rect.height,
            originalIdOrder,
            prevIdOrder:[...originalIdOrder],
            currentIdOrder:[...originalIdOrder],
            moviesRect
        }
        //cách 1: do setState chạy trước macrotask
        setTimeout(()=>{
            const draggingItemRect=draggingItemRef.current;
            draggingItemRect.style.width = draggingInfoRef.current.width+'px';
            draggingItemRect.style.height = draggingInfoRef.current.height+'px';
            setPos(e);
        },0);
        //cách 2: đẩy đoạn này ra ngoài dùng useEffect

        document.addEventListener('mousemove', handleMouseMove.current);
        document.addEventListener('mouseup', handleMouseUp.current)
    },[]);

    const handleSubmit = useCallback((id,editingText) => {
        if (editingText.trim() === '') return;
        setMovies(prev=>prev.map((movie) => movie.id === id ? { ...movie, text: editingText } : movie));
    },[])

    return (
        <>
            <div className="container" ref={containerRef}>
                {movies.map((movie) => {
                    const isDragging = draggingInfoRef.current?.id === movie.id;
                    return (
                        <Item
                            key={movie.id}
                            isDragging={isDragging}
                            movie={movie}
                            onMouseDown={handleMouseDown}
                            handleSubmit={handleSubmit}
                        />
                    )
                })}
            </div>
            {dragging && (
                <div
                    ref={draggingItemRef}
                    id='dragging-item'
                    className='item dragging'
                >
                    {movies.find(m => m.id === draggingInfoRef.current?.id)?.text}
                </div>
            )}
        </>
    )
}