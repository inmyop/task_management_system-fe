import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { history } from '_helpers';

const name = 'auth';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')),
    error: null
};

export const login = createAsyncThunk(`${name}/login`, async ({ email, password }) => {
    try {
        const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1`;
        const response = await axios.post(`${baseUrl}/login`, { email, password });
        const user = response.data;
        // console.log('user', user)
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        throw error.response.data.message;
    }
});

export const register = createAsyncThunk(`${name}/register`, async ({ name, email, password, password_confirmation }) => {
    try {
        const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1`;
        const response = await axios.post(`${baseUrl}/register`, { name, email, password, password_confirmation });
        const user = response.data;
        console.log('user', user)
        // localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.log(error)
        throw error.response.data.message;
    }
});

export const logout = createAsyncThunk(`${name}/logout`, async () => {
    try {
        const token = JSON.parse(localStorage.getItem('user'))?.data?.access_token;
        const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1`;

        if (token) {
            await axios.post(`${baseUrl}/logout`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        localStorage.removeItem('user');
    } catch (error) {
        throw error;
    }
});

const authSlice = createSlice({
    name,
    initialState,
    reducers: {
        clearUser(state) {
            state.user = null;
            localStorage.removeItem('user');
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                const { from } = history.location.state || { from: { pathname: '/' } };
                history.navigate(from);
            })
            
            .addCase(login.rejected, (state, action) => {
                state.error = action.error;
            })

            .addCase(register.fulfilled, (state, action) => {
                const { from } = history.location.state || { from: { pathname: '/login' } };
                history.navigate(from);
            })

            // .addCase(register.rejected, (state, action) => {
            //     state.error = action.error;
            // })

            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                history.navigate('/login');
            });
    }
});

export const authActions = { ...authSlice.actions, login, logout, register };
export const authReducer = authSlice.reducer;
