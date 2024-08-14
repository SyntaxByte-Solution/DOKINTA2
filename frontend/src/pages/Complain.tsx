import DoctorComplain from "@/component/complain/DoctorComplain";
import UserComplain from "@/component/complain/UserComplain";
import RootLayout from "@/component/layout/Layout";
import ServicesDialogue from "@/component/services/ServicesDialogue";
import Button from "@/extra/Button";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import {
  deleteDoctorPendingComplain,
  deleteDoctorSolveComplain,
  deleteUserPendingComplain,
  deleteUserSolveComplain,
  getDoctorPendingComplain,
  getDoctorSolvedComplain,
  getUserPendingComplain,
  getUserSolvedComplain,
} from "@/store/complainSlice";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError, warning } from "@/utils/Alert";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface ComplainData {
  _id: any,
  name: string,
  image: string,
  dob: string,
  details: string,
  appointmentId: number,
  doctor: {
    name: string,
    dob: string
  },
}

interface UserData {
  _id: any,
  name: string,
  image: string,
  details: string,
  appointmentId: number,
  solvedDate : string
  user: {
    name: string,
    dob: string,
  }
}

const Complain = () => {

  const dispatch = useAppDispatch();

  const [type, setType] = useState<string>("user");

  useEffect(() => {
   dispatch(getUserPendingComplain());
   dispatch(getUserSolvedComplain());
   dispatch(getDoctorPendingComplain());
   dispatch(getDoctorSolvedComplain());
  }, [dispatch]);

  return (
    <>
      <div className={`userTable`}>
        <Title name="Complain" />
        <div
          className="my-2"
          style={{
            width: "172px",
            border: "1px solid #1c2b20",
            padding: "4px",
            borderRadius: "40px",
          }}
        >
          <button
            type="button"
            className={`${type === "user" ? "activeBtn" : "disabledBtn"}`}
            onClick={() => setType("user")}
          >
            User
          </button>
          <button
            type="button"
            className={`${
              type === "doctor" ? "activeBtn" : "disabledBtn"
            } ms-1`}
            onClick={() => setType("doctor")}
          >
            Doctor
          </button>
        </div>

        {type === "user" && <UserComplain />}
        {type === "doctor" && <DoctorComplain />}
      </div>
    </>
  );
};
Complain.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
export default Complain;
