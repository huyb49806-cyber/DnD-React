import React, { useState, forwardRef } from 'react'

const Item=forwardRef(({ isDragging, movie, onMouseDown, handleSubmit }, ref)=> {
    console.log(2);
    const [isEditing, setIsEditing] = useState(false);
    const [editingText, setEdittingText] = useState('');

    const handleDoubleClick = (movie) => {
        setIsEditing(true);
        setEdittingText(movie.text);
    }
    const handleChange = (e) => {
        setEdittingText(e.target.value);
    }

    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter'){
            handleSubmit(id, editingText);
            setIsEditing(false);
        }
        else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    }


    return (
        <>
            <div
                ref={ref}
                className={
                    `flex-item 
                  item
                  ${isDragging ? "placeholder" : ""}`
                }
                onMouseDown={(e) => onMouseDown(e, movie)}
                data-id={movie.id}
            >
                {isEditing ? (
                    <input
                        autoFocus
                        type='text'
                        value={editingText}
                        onChange={handleChange}
                        onBlur={() => {
                            handleSubmit(movie.id, editingText);
                            setIsEditing(false);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, movie.id)}
                        onMouseDown={(e) => e.stopPropagation()}

                    >
                    </input>
                ) : (
                    <span
                        style={{ userSelect: 'none' }}
                        onDoubleClick={() => handleDoubleClick(movie)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {movie.text}
                    </span>
                )}
            </div>
        </>
    )
})

export default React.memo(Item);