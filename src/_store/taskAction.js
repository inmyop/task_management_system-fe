import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
// create slice
import Swal from 'sweetalert2';

const name = 'tasks';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers });

// exports

export const taskActions = { ...slice.actions, ...extraActions };
export const taskReducer = slice.reducer;

function createInitialState() {
    return {
        tasks: {}
    }
}

function createExtraActions() {
    const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1`;

    const getAll = createAsyncThunk(
        `${name}/getAll`,
        async (params) => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.data?.access_token;
                
                if (token) {
                    let response;
                    if(params !== undefined){
                        const searchQuery = params.search;
                        const dateQuery = params.date
                        response = await axios.get(`${baseUrl}/task/get`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            params: {
                                search: searchQuery,
                                date: dateQuery
                            }
                        });
                    } else {
                        response = await axios.get(`${baseUrl}/task/get`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                    }

                    // console.log('res tasks', response)
                    return response.data;
                } else {
                    throw new Error('Token not found');
                }
            } catch (error) {
                console.log('err', error)
                throw error;
            }
        }
    );

    const deleteTask = createAsyncThunk(`${name}/deleteTask`, async (taskCode, { dispatch, getState }) => {
        try {
          const token = JSON.parse(localStorage.getItem('user'))?.data?.access_token;
          if (token) {
            await axios.delete(`${baseUrl}/task/delete/${taskCode}`, {
              headers: {
                Authorization: `Bearer ${token}`
              },
            });
      
            dispatch(getAll());
          } else {
            throw new Error('Token not found');
          }
        } catch (error) {
          throw error;
        }
      });
      
      const downloadTaskFile = createAsyncThunk(
        `${name}/downloadTaskFile`,
        async (task, thunkAPI) => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.data?.access_token;
                if (token) {
                    const response = await axios.get(`${baseUrl}/task/detail/${task.task_code}?download=true`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        responseType: 'blob',
                    });
                    console.log("respon download", response)
    
                    const contentType = response.headers['content-type'];
    
                    function getExtensionFromContentType(contentType) {
                        switch (contentType) {
                            case 'application/pdf':
                                return 'pdf';
                            case 'application/jpg':
                            case 'image/jpeg':
                                return 'jpg';
                            case 'application/png':
                            case 'image/png':
                                return 'png';
                            case 'application/webp':
                            case 'image/webp':
                                return 'webp';
                            case 'application/doc':
                                return 'doc';
                            case 'application/docx':
                                return 'docx';
                            case 'application/csv':
                                return 'csv';
                            case 'application/ppt':
                                return 'ppt';
                            case 'application/pptx':
                                return 'pptx';
                            default:
                                return 'zip';
                        }
                    }
                    
                    const fileExtension = getExtensionFromContentType(contentType);
                    const filename = `Berkas - ${task.title}.${fileExtension}`;

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename); 
    
                    document.body.appendChild(link);
                    link.click();
    
                    document.body.removeChild(link);
                } else {
                    throw new Error('Token not found');
                }
            } catch (error) {
                console.log("err dwld", error?.response?.statusText);
                Swal.fire({
                    title: 'Error',
                    text: error?.response?.statusText,
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    timer: 2000
                });
            }
        }
    );

    const addTask = createAsyncThunk(`${name}/addTask`, async (params) => {
        try {
          const token = JSON.parse(localStorage.getItem('user'))?.data?.access_token;
        //   console.log(token);
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
            axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
            const response = await axios.post(`${baseUrl}/task/add`, params);
            console.log('res add', response);
            return response.data
          } else {
            throw new Error('Token not found');
          }
        } catch (error) {
            console.log('add error', error)
          throw error;
        }
      });

    const updateTask = createAsyncThunk(`${name}/updateTask`, async (params) => {
        try {
          const token = JSON.parse(localStorage.getItem('user'))?.data?.access_token;
        //   console.log(token);
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
            axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
            const response = await axios.post(`${baseUrl}/task/update`, params);
            console.log('res add', response);
            return response.data
          } else {
            throw new Error('Token not found');
          }
        } catch (error) {
            console.log('add error', error)
          throw error;
        }
      });
    
    return { getAll, deleteTask, downloadTaskFile, addTask, updateTask};
}

function createExtraReducers() {
    return (builder) => {
        const actions = createExtraActions();
        const { pending, fulfilled, rejected } = actions.getAll;

        builder
            .addCase(pending, (state) => {
                state.tasks = { loading: true };
            })
            .addCase(fulfilled, (state, action) => {
                state.tasks = action.payload;
            })
            .addCase(rejected, (state, action) => {
                state.tasks = { error: action.error };
            });
    };
}