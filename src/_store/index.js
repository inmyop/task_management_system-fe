import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authAction';
import { taskReducer } from './taskAction';

export * from './authAction';
export * from './taskAction'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer
    },
});