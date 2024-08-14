import { Success } from "@/api/toastServices";
import { apiInstance, apiInstanceFetch } from "@/utils/ApiInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface SettingState {
  setting: any[];
  isLoading: boolean;
  isSkeleton: boolean;
}

const initialState: SettingState = {
  setting: [],
  isLoading: false,
  isSkeleton: false,
};

interface SettingPayload {
  meta?: any;
  id?: any;
  data: any;
  settingId: any;
  payload: any;
  type: any;
  status: any;
}

export const getSetting : any = createAsyncThunk(
  "admin/setting",
  async (payload: SettingPayload | undefined) => {
    return apiInstance.get("admin/setting");
  }
);

export const updateSetting : any = createAsyncThunk(
  "admin/setting/update",
  async (payload: any | undefined) => {

    console.log("paylaod" , payload)

    return apiInstance.patch(`admin/setting/update`, payload);
  }
);


export const handleSetting: any = createAsyncThunk(
  "admin/setting/handleSwitch",
  async (payload: SettingPayload | undefined) => {
    console.log("Can I Reach in a Slice Page")
    return apiInstance.put(
      `admin/setting/handleSwitch?type=${payload?.type}`
    );

  }
);

const settingSlice = createSlice({
  name: "settingSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSetting.pending, (state, action) => {
      state.isLoading = true;
    });

    builder.addCase(getSetting.fulfilled, (state, action) => {
      state.isLoading = false;
      state.setting = action?.payload?.setting;
    });

    builder.addCase(getSetting.rejected, (state, action) => {
      state.isLoading = false;
    });

    builder.addCase(updateSetting.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(updateSetting.fulfilled, (state, action) => {

      console.log("action" , action.payload)

      if (action.payload.status) {
        state.setting = { ...state.setting, ...action.payload.setting };
        Success("Setting Updated Successfully");
      }
      state.isLoading = false;
    });

    // builder.addCase(updateSetting.rejected, (state) => {});

    // builder.addCase(maintenanceMode.fulfilled, (state, action) => {
    //   if (action.payload.status) {
    //     state.setting = { ...state.setting, ...action.payload.setting };
    //     Success("Maintenance Mode Updated Successfully");
    //   }
    //   state.isLoading = false;
    // });
    builder.addCase(handleSetting.fulfilled, (state, action) => {
      state.setting = action.payload.setting;
      Success("Updated Successfully");
    });
  },
});


export default settingSlice.reducer