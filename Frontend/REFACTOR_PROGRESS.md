# Refactor Progress — Redux Foundation & Feature Migration

## Source baseline
- Frontend workspace: `Frontend/WebApplication`.
- Existing React 18, TypeScript, Vite, Redux Toolkit, React Redux, and Axios dependencies are retained.
- Existing Axios base URL remains `http://localhost:8080/api/`.

## Existing architecture retained
- Existing role-based Pages folders (`src/pages/{authorization,guest,member,admin,staff,mentor}`) and Atomic Design component layers (`atoms`, `molecules`, `organisms`, `templates`) are retained.
- Existing `App.tsx` route definitions and route URLs are retained without redesign.
- Existing auth state implementation is retained and re-exported through `features/auth/authSlice.ts`.
- Existing global styles and `scrollToTop` utility are retained.

## Redux foundation
- `app/provider/appProvider.tsx`: shared Redux Provider wrapper.
- `app/store/store.ts`: registers `auth`, `courses`, `students`, `members`, `mentors`, `staff`, `classes`, `exams`, `invoices`, and `news` reducers.
- `app/store/hooks.ts`: typed `useAppDispatch` and `useAppSelector` hooks.
- `features/shared/createFeatureSlice.ts`: transitional request-state slice factory used by not-yet-migrated features.
- `main.tsx` uses `AppProvider`; `BrowserRouter` remains outside `App`.

## Feature Migration Status

### 1. Authentication (Inspected & Retained)
- `app/store/authSlice.ts` + `features/auth/authSlice.ts`: manages `user`, `isAuthenticated`, and `sessionStorage` (`loginedUser`) synchronization.
- `loginForm.tsx` dispatches `setAuthenticatedUser`.

### 2. Courses (Completed & Validated)
- **Feature files**:
  - `src/features/courses/coursesTypes.ts`: typed domain records (`CourseRecord`, `CourseDetailRecord`, `CourseContentRecord`), payloads (`CreateCoursePayload`, `UpdateCoursePayload`, `AddCourseContentPayload`, `CreateCourseDetailsItem`, `CourseMonthQuery`), and `CoursesState`.
  - `src/features/courses/coursesApi.ts`: dedicated API service wrapping all Course, CourseDetail, CourseDetails, and CourseContent endpoints.
  - `src/features/courses/coursesSlice.ts`: endpoint-specific async thunks (`fetchCourseList`, `fetchInactiveCourses`, `fetchCourseById`, `fetchCoursesByMonth`, `createCourse`, `updateCourse`, `activateCourse`, `deactivateCourse`, `fetchCourseDetailsByMonth`, `fetchCourseDetailsByCourseId`, `addCourseDetails`, `fetchCourseContents`, `addCourseContent`), typed state, reducers, and selectors.
- **Endpoints migrated (`13` endpoints, `0` direct Axios calls remaining for Courses)**:
  - `GET Course/list`
  - `GET Course/inactive-courses`
  - `GET Course/${courseId}`
  - `GET Course/courseMonth?month=${month}&year=${year}`
  - `POST Course/add`
  - `PUT Course/update`
  - `PATCH Course/activate/${courseId}`
  - `DELETE Course/deactivate/${courseId}`
  - `GET /CourseDetail?courseMonth=${courseMonth}`
  - `GET CourseDetail/${courseId}`
  - `POST CourseDetails/add`
  - `GET CourseContent`
  - `POST CourseContent/add`
- **Components migrated (`21` components)**:
  - `guestCourseSection.tsx`
  - `guestCourseTable.tsx`
  - `memberCourseSection.tsx`
  - `memberCourseTable.tsx`
  - `memberInformationSection.tsx`
  - `memberPracticeListTable.tsx`
  - `memberRegisteredCourse.tsx`
  - `adminCourseTable.tsx`
  - `adminCourseUpdateForm.tsx`
  - `adminCreateCourseForm.tsx` (`CreateCourseForm` & `CreateCourseDetail`)
  - `adminInactiveCourseTable.tsx`
  - `adminDashboardSection.tsx`
  - `adminCreateClassForm.tsx` (`CreateTheoryLesson` & `CreatePracticeLesson`)
  - `adminCreateExamForm.tsx`
  - `staffCourseTable.tsx`
  - `staffCourseUpdateForm.tsx`
  - `staffCreateCourseForm.tsx`
  - `staffInactiveCourseTable.tsx`
  - `staffCreateExamForm.tsx`
  - `staffMemberTable.tsx`
  - `mentorClassRegister.tsx`

### Remaining Features to Migrate (In Order)
3. **Members and Students**: `Members`, `Member/*`, `Students`, `Student/*`, `Users`
4. **Mentors and Staff**: `Mentor/*`, `Staff/*`
5. **Classes and Lessons**: `Class/*`, `ClassStudent`, `Lesson/*`, `Curriculum/*`
6. **Exams and Tests**: `Exam/*`, `Test/*`, `TestByStudentId`, `GetStudentQuestion/*`, `CheckStudentAnswer`
7. **Invoices**: `Invoice/*`
8. **News**: `News/*`

## Validation Results
- `npx tsc --noEmit`: **PASSED** (0 errors)
- `npm run build` (`tsc && vite build`): **PASSED** (2542 modules transformed, built in 22.33s)
