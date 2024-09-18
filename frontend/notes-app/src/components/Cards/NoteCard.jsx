import moment from 'moment';
import React from 'react';
import { MdOutlinePushPin, MdCreate, MdDelete } from 'react-icons/md';

const NoteCard = ({
    title,
    date,
    content,
    tags,
    isPinned,
    onEdit,
    onDelete,
    onPinNote,
    onClick, // Add onClick prop here
}) => {
  return (
    <div 
      className='border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out cursor-pointer' 
      onClick={onClick} // Make the entire card clickable
    >
        <div className='flex items-center justify-between'>
            <div>
                <h6 className='text-sm font-medium'>{title}</h6>
                <span className='text-xs'>{moment(date).format('Do MMM YYYY')}</span>
            </div>

            <MdOutlinePushPin 
              className={`icon-btn ${isPinned ? 'text-primary' : 'text-slate-300'}`} 
              onClick={(e) => { e.stopPropagation(); onPinNote(); }} // Prevents triggering the card's onClick
            />
        </div>
        <p className='text-xs text-slate-500 mt-2'>
            {content?.slice(0,60)}
        </p>

        <div className='flex items-center justify-between mt-2'>
            <div className='text-xs text-slate-500'>
                {Array.isArray(tags) ? tags.map((item, index) => `#${item} `) : ''}
            </div>

            <div className='flex items-center gap-2'>
                <MdCreate 
                    className='icon-btn hover:text-green-600'
                    onClick={(e) => { e.stopPropagation(); onEdit(); }} // Prevents triggering the card's onClick
                />

                <MdDelete 
                    className='icon-btn hover:text-red-500'
                    onClick={(e) => { e.stopPropagation(); onDelete(); }} // Prevents triggering the card's onClick
                />
            </div>
        </div>
    </div>
  );
};

export default NoteCard;
