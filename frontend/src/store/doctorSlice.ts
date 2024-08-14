import { Success } from "@/api/toastServices";
import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { setToast } from "@/utils/toastServices";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface UserState {
  doctor: any[];
  doctorPendingRequest: any[];
  doctorAcceptedRequest: any[];
  doctorRejectedRequest: any[];
  doctorAppointment: any[];
  doctorEarning: any[];
  doctorReview: [],
  doctorProfile: any;
  isLoading: boolean;
  isSkeleton: boolean;
  total: number;
  wallet: number;

}

const initialState: UserState = {
  doctor: [],
  total: 0,
  wallet: 0,
  doctorPendingRequest: [],
  doctorAcceptedRequest: [],
  doctorRejectedRequest: [],
  doctorAppointment: [],
  doctorEarning: [],
  doctorReview: [],
  doctorProfile: {},
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
  meta: any;
  id?: any;
  data: any;
  doctorId: any;
  payload: any;
  status: any;
}

export const getAllDoctor = createAsyncThunk(
  "admin/doctor",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/doctor?start=${payload?.start}&limit=${payload?.limit}&search=${payload?.search}`
    );
  }
);

export const getDoctorProfile = createAsyncThunk(
  "admin/doctor/profile",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/doctor/profile?doctorId=${payload}`);
  }
);

export const getDoctorReview: any = createAsyncThunk(
  "admin/review/doctorReview",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/review/doctorReview?doctorId=${payload?.id}&start=${payload?.start}&limit=${payload?.limit}`);
  }
);

export const updateDoctor = createAsyncThunk(
  "admin/doctor/updateProfile",
  async (payload: AllUsersPayload | undefined) => {
    return axios.patch(
      `admin/doctor/updateProfile?doctorId=${payload?.doctorId}`,
      payload?.data
    );
  }
);

export const blockDoctor = createAsyncThunk(
  "admin/doctor/blockUnblock",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.patch(`admin/doctor/blockUnblock?doctorId=${payload}`);
  }
);
export const deleteDoctor = createAsyncThunk(
  "admin/doctor/delete",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.patch(`admin/doctor/delete?doctorId=${payload}`);
  }
);

export const getPendingRequest = createAsyncThunk(
  "admin/doctorRequest?type=1",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/doctorRequest?type=1`);
  }
);
export const getAcceptedRequest = createAsyncThunk(
  "admin/doctorRequest?type=2",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/doctorRequest?type=2`);
  }
);
export const getRejectedRequest = createAsyncThunk(
  "admin/doctorRequest?type=3",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(`admin/doctorRequest?type=3`);
  }
);

export const getParticularDoctorAppointment = createAsyncThunk(
  "admin/appointment/getParticularDoctor",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/appointment/getParticularDoctor?doctorId=${payload?.doctorId}&start=${payload?.start}&limit=${payload?.limit}&startDate=${payload?.startDate}&endDate=${payload?.endDate}&status=${payload?.status}`
    );
  }
);
export const getParticularDoctorEarning = createAsyncThunk(
  "admin/doctorWallet",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstanceFetch.get(
      `admin/doctorWallet/?doctorId=660bf127a04fa0a1da265cd7&type=${payload?.status}`
    );
  }
);

export const doctorActionAccepted = createAsyncThunk(
  "admin/doctorRequest/accept",
  async (payload: AllUsersPayload | undefined) => {
    return apiInstance.post(
      `admin/doctorRequest/accept?requestId=${payload}`
    );

  }
);

export const doctorActionDeclined = createAsyncThunk(
  "admin/doctorRequest/decline",
  async (payload: AllUsersPayload | undefined) => {

    console.log('Can I Reach Here!!')
    debugger
    return apiInstance.post(
      `admin/doctorRequest/decline?requestId=${payload}`
    );

  }
);


const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAllDoctor.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getAllDoctor.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.doctor = action.payload.data;
      }
    );
    builder.addCase(getAllDoctor.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(getDoctorProfile.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getDoctorProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.doctorProfile = action?.payload?.data;
    });

    builder.addCase(getDoctorProfile.rejected, (state, action) => {
      state.isLoading = false;
    });


    builder.addCase(getDoctorReview.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getDoctorReview.fulfilled, (state, action) => {
      state.isLoading = false;
      state.doctorReview = action?.payload?.data;
    });

    builder.addCase(getDoctorReview.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateDoctor.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(
      doctorActionAccepted.fulfilled,
      (state, action) => {
        console.log('action', action.payload)
        debugger
        state.isLoading = false;
        state.doctorPendingRequest = state?.doctorPendingRequest?.filter((doctor) => doctor?._id !== action?.meta?.arg);
      }
    );

    builder.addCase(
      doctorActionDeclined.fulfilled,
      (state, action) => {
        debugger
        console.log('first', action?.payload)
        state.isLoading = false;
        state.doctorPendingRequest = state?.doctorPendingRequest?.filter((doctor) => doctor?._id !== action?.meta?.arg);
        state.doctorRejectedRequest.unshift((action.payload as any)?.request);
      }
    );

    builder.addCase(
      updateDoctor.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload.status) {

          debugger

          const doctorIdx = state.doctor.findIndex(
            (doctor: any) => doctor?._id === action.payload?.data?.data?._id
          );
          // console.log('doctorIdx', doctorIdx)
          if (doctorIdx !== -1) {
            state.doctor[doctorIdx] = {
              ...state.doctor[doctorIdx],
              ...action.payload.data.data,
            };
          }

          // console.log('state.doctor', state.doctor)

          state.doctorProfile = action.payload.doctor;
          Success("Doctor Update Successfully");
        }
        state.isLoading = false;
      }
    );

    builder.addCase(updateDoctor.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(blockDoctor.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(blockDoctor.fulfilled, (state: any, action: any) => {
      if (action?.payload?.status) {
        const blockDoctorIndx = action?.payload?.data;
        const doctorIndx = state.doctor.findIndex(
          (doctor: any) => doctor?._id === blockDoctorIndx?._id
        );
        if (doctorIndx !== -1) {
          state.doctor[doctorIndx] = {
            ...state.doctor[doctorIndx],
            ...action.payload.data,
          };
        }
        action.payload.data?.isBlock === true
          ? setToast("success", "Doctor Block Successfully")
          : setToast("success", "Doctor Unblock Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(blockDoctor.rejected, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(deleteDoctor.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(deleteDoctor.fulfilled, (state: any, action: any) => {
      if (action?.payload?.status) {
        state.doctor = state.doctor.filter(
          (doctor) => doctor._id !== action?.meta?.arg
        );
        setToast("success", "Doctor Delete Successfully");
      }
      state.isLoading = false;
    });

    builder.addCase(deleteDoctor.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(
      getPendingRequest.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getPendingRequest.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.doctorPendingRequest = action.payload.data;
      }
    );
    builder.addCase(getPendingRequest.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      getAcceptedRequest.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
      }
    );

    builder.addCase(
      getAcceptedRequest.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.doctorAcceptedRequest = action.payload.data;
      }
    );

    builder.addCase(getAcceptedRequest.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(
      getRejectedRequest.pending,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = true;
        state.isLoading = true;
      }
    );

    builder.addCase(
      getRejectedRequest.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.isSkeleton = false;
        state.doctorRejectedRequest = action.payload.data;
        state.isLoading = false;

      }
    );
    builder.addCase(getRejectedRequest.rejected, (state) => {
      state.isSkeleton = false;
    });

    builder.addCase(getParticularDoctorAppointment.pending, (state) => {
      state.isSkeleton = true;
    });

    builder.addCase(
      getParticularDoctorAppointment.fulfilled,
      (state, action) => {
        state.isSkeleton = false;
        state.doctorAppointment = action.payload.data;
        state.total = action.payload.total;
      }
    );
    builder.addCase(getParticularDoctorAppointment.rejected, (state) => {
      state.isSkeleton = false;
    });
    builder.addCase(getParticularDoctorEarning.pending, (state) => {
      state.isSkeleton = true;
    });

    builder.addCase(getParticularDoctorEarning.fulfilled, (state, action) => {

      state.isSkeleton = false;
      state.doctorEarning = action.payload.data;
      state.total = action.payload.total;
      state.wallet = action.payload.wallet

    });
    builder.addCase(getParticularDoctorEarning.rejected, (state) => {
      state.isSkeleton = false;
    });


  },
});

export default doctorSlice.reducer;
