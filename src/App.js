import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import './App.css';
import { withAuthenticator, Button, TextField, Flex } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App({ isPassedToWithAuthenticator, signOut, user }) {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <Flex justifyContent="center" alignItems="center" >
      <TextField label="Name" onChange={e => setFormData({ ...formData, 'name': e.target.value})} 
      placeholder="Note name" value={formData.name}/>
      <TextField label="Note Description" onChange={e => setFormData({ ...formData, 'description': e.target.value})} 
      placeholder="Note name" value={formData.description}/>
      <Button loadingText="Create note" onClick={createNote} >Create Note</Button>
      </Flex>
      <Flex justifyContent="center" alignItems="center" >
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
            <Flex justifyContent="center" alignItems="center" >
            <h2>{note.name}</h2>
              <p>{note.description}</p>
              <Button variation="link" loadingText="Delete note" onClick={() => deleteNote(note)} >Delete note</Button>
            </Flex>
            </div>
          ))
        }
      </div>
      </Flex>
      <Flex justifyContent="center" alignItems="center" >
      <Button variation="primary" loadingText="sign Out" onClick={signOut} ariaLabel="" >Sign out</Button>
      </Flex>
    </div>
  );
}

export default withAuthenticator(App);