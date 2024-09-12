import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import NoteCard from '../../components/Cards/NoteCard'

const Home = () => {
  return (
    <>
      <Navbar/>

      <div className='container mx-auto'>
        <NoteCard
          title="Meeting Notes"
          content="Discuss project milestones and next steps for Q4."
          date="Sep 12, 2024"
          tags="#Meeting"
          isPinned={true}
          onEdit={() => {}}
          onDelete={() => {}}
          onPinNote={() => {}}

        />
      </div>

    </>
  )
}

export default Home