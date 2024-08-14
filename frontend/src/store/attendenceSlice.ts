import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface UserState {
  attendence: any[];
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: UserState = {
  attendence: [],
  isLoading: false,
  isSkeleton: false,
};

interface AllUsersPayload {
  start?: number;
  limit?: number;
  search: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  meta?: any;
  id?: any;
  data: any;
  doctorId: any;
  payload: any;
  month: any;
}

export const getAttendebnce = createAsyncThunk(
  "admin/attendance",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/attendance?doctorId=${payload?.doctorId}&month=${payload?.month}`
    );
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAttendebnce.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );
    builder.addCase(
      getAttendebnce.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.attendence = action.payload.data;
      }
    );
    builder.addCase(
      getAttendebnce.rejected,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
      }
    );
  },
});

export default attendanceSlice.reducer;
