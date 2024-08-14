import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";


interface SuggestionState {
    userSuggestion : [],
    doctorSuggestion : []
    isLoading : boolean
}

const initialState : SuggestionState = {
    userSuggestion : [],
    doctorSuggestion : [],
    isLoading : false
}
interface AllUsersPayload {
    start?: number;
    limit?: number;
    id?: string;
    data?: any;
    payload?: any;
    type : number
  }
  

export const getUserSuggestion = createAsyncThunk(
    "admin/complain/usersuggestions",
    async (payload: AllUsersPayload | undefined) => {
      return apiInstanceFetch.get(`admin/complain/suggestions?person=2&start=0&limit=2`);
    }
  );

  export const getDoctorSuggestion = createAsyncThunk(
    "admin/complain/doctorsuggestions",
    async (payload: AllUsersPayload | undefined) => {
      return apiInstanceFetch.get(`admin/complain/suggestions?person=1&start=0&limit=2`);
    }
  );

  const suggestionSlice = createSlice({
    name: "suggestion",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            getUserSuggestion.pending,
          (state, action: PayloadAction<any>) => {
            state.isLoading = true;
          }
        );

        builder.addCase(
            getUserSuggestion.fulfilled,
            (state, action: PayloadAction<any>) => {
              state.isLoading = false;
              state.userSuggestion = action.payload.data;
            }
          );

          builder.addCase(
            getDoctorSuggestion.fulfilled,
            (state, action: PayloadAction<any>) => {
              state.isLoading = false;
              state.doctorSuggestion = action.payload.data;
            }
          );
    }
  })

  export default suggestionSlice.reducer