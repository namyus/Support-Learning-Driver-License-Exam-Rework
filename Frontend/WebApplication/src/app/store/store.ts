import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import coursesReducer from '../../features/courses/coursesSlice';
import studentsReducer from '../../features/students/studentsSlice';
import membersReducer from '../../features/members/membersSlice';
import mentorsReducer from '../../features/mentors/mentorsSlice';
import staffReducer from '../../features/staff/staffSlice';
import classesReducer from '../../features/classes/classesSlice';
import examsReducer from '../../features/exams/examsSlice';
import invoicesReducer from '../../features/invoices/invoicesSlice';
import newsReducer from '../../features/news/newsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    students: studentsReducer,
    members: membersReducer,
    mentors: mentorsReducer,
    staff: staffReducer,
    classes: classesReducer,
    exams: examsReducer,
    invoices: invoicesReducer,
    news: newsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
