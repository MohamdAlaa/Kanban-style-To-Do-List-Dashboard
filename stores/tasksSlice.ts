import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Task {
  id: number;
  title: string;
  description: string;
  column: string;
  order: number;
}

interface TasksState {
  search: string;
}

const initialState: TasksState = {
  search: "",
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
  },
});

export const { setSearch } = tasksSlice.actions;
export default tasksSlice.reducer;
