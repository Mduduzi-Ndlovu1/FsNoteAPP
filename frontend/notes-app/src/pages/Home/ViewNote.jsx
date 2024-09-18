import React from 'react';
import { MdClose } from 'react-icons/md';

const ViewNote = ({ noteData, onClose, onEdit, onDelete }) => {
    if (!noteData) return null;

    const { title, content, tags } = noteData;

    return (
        <div className='relative'>

            <button
                className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50'
                onClick={onClose}
            >
                <MdClose className='text-xl text-slate-400'/>
            </button>

            <div className='flex flex-col gap-2'>
                <label className='input-label'>Title</label>
                <input 
                    type='text'
                    className='text-2xl text-slate-950 outline-none bg-slate-50 p-2 rounded'
                    value={title}
                    readOnly // Makes the field read-only
                />
            </div>

            <div className='flex flex-col gap-2 mt-4'>
                <label className='input-label'>CONTENT</label>
                <textarea
                    type='text'
                    className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                    rows={10}
                    value={content}
                    readOnly // Makes the field read-only
                />
            </div>

            <div className='mt-3'>
                <label className='input-label'>TAGS</label>
                <div className='flex flex-wrap gap-2'>
                    {Array.isArray(tags) ? tags.map((tag, index) => (
                        <span key={index} className='px-3 py-1 bg-slate-200 rounded-full text-xs'>
                            #{tag}
                        </span>
                    )) : ''}
                </div>
            </div>

            <div className='flex items-center gap-2 mt-5'>
                <button 
                    className='btn-primary font-medium p-3'
                    onClick={onEdit}
                >
                    EDIT
                </button>
                <button 
                    className='btn-danger font-medium p-3'
                    onClick={onDelete}
                >
                    DELETE
                </button>
            </div>

        </div>
    );
}

export default ViewNote;
