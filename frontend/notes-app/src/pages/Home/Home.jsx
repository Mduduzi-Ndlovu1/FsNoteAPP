import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNote from './AddEditNote';
import ViewNote from './ViewNote'; // Import ViewNote
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/ToastMessage/Toast';

const Home = () => {
  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [openViewNoteModel, setOpenViewNoteModel] = useState({
    isShown: false,
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModel({
      isShown: true,
      data: noteDetails,
      type: 'edit',
    });
  };

  const handleViewNote = (noteDetails) => {
    setOpenViewNoteModel({
      isShown: true,
      data: noteDetails,
    });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-all-users");
      if (response.data && response.data.userId) {
        setUserInfo(response.data.userId);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An Unexpected Error Occurred. Please try again later.");
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", 'delete');
        getAllNotes();
      }
    } catch (error) {
      console.log("An Unexpected Error Occurred. Please try again later.");
    }
  };

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: {
          query,
        },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
        isPinned: !noteData.isPinned,
      });
      if (response.data && response.data.note) {
        showToastMessage("Note Pinned Successfully", 'Pinned');
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />

      <div className='container mx-auto'>
        <div className='grid grid-cols-3 gap-4 mt-8'>
          {allNotes.map((item, index) => (
            <NoteCard
              key={item._id}
              title={item.title}
              content={item.content}
              date={item.createdOn}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteNote(item)}
              onPinNote={() => updateIsPinned(item)}
              onClick={() => handleViewNote(item)} // Open note details on click
            />
          ))}
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
      </div>
      <button 
        className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
        onClick={() => {
          setOpenAddEditModel({ isShown: true, type: 'add', data: null });
        }}
      >
        <MdAdd className='text-[32px] text-white' />
      </button>
      <Modal
        isOpen={openAddEditModel.isShown}
        onRequestClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })}
        style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)' } }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-hidden"
      >
        <AddEditNote 
          type={openAddEditModel.type}
          noteData={openAddEditModel.data}
          onClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <Modal
        isOpen={openViewNoteModel.isShown}
        onRequestClose={() => setOpenViewNoteModel({ isShown: false, data: null })}
        style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)' } }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-hidden"
      >
        <ViewNote
          noteData={openViewNoteModel.data}
          onClose={() => setOpenViewNoteModel({ isShown: false, data: null })}
          onEdit={() => {
            setOpenViewNoteModel({ isShown: false, data: null });
            setOpenAddEditModel({
              isShown: true,
              type: 'edit',
              data: openViewNoteModel.data,
            });
          }}
          onDelete={() => deleteNote(openViewNoteModel.data)}
        />
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
}

export default Home;
