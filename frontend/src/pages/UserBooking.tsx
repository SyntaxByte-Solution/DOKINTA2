import RootLayout from "@/component/layout/Layout";
import Table from "@/extra/Table";
import Title from "@/extra/Title";
import { RootStore, useAppDispatch } from "@/store/store";
import { getUserAppointment } from "@/store/userSlice";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface userBookingData {
  _id: any;
  time: string;
  amount: number;
  user: {
    name: string;
  };

  date: string;
  appointmentId: any;
  doctor: {
    name: string;
    image: string;
  };
  service: string;
}

export default function UserBooking() {
  const dispatch = useAppDispatch();
  const { booking } = useSelector((state: RootStore) => state.user);
  const [page, setPage] = useState<any>(0);
  const [rowPerPage, setrowPerPage] = useState<any>(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  const router = useRouter();
  const id: any = router?.query?.id;

  useEffect(() => {
    let payload: any = {
      id: id,
      start: page,
      limit: rowPerPage,
      startDate: startDate,
      endDate: endDate,
      status: status,
    };
    dispatch(getUserAppointment(payload));
  }, [dispatch]);

  const bookingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Doctor",
      Cell: ({ row, index }: { row: userBookingData; index: number }) => (
        <div className="userProfile">
          <div className="userProfile">
            <img
              src={row?.doctor?.image}
              style={{ width: "70px", height: "70px" }}
              alt={`Doctor ${page * rowPerPage + index + 1}`}
            />
          </div>
        </div>
      ),
    },

    {
      Header: "Name",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.user?.name}
        </span>
      ),
    },

    {
      Header: "Doctor Name",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.doctor?.name}
        </span>
      ),
    },

    {
      Header: "AppoinmentId",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.appointmentId}
        </span>
      ),
    },

    {
      Header: "Service",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.service}</span>
      ),
    },

    {
      Header: "Time",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.time}</span>
      ),
    },

    {
      Header: "Amount",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.amount}</span>
      ),
    },

    {
      Header: "Status",
      Cell: ({ row }) =>
        row?.status === 1 ? (
          <button
            className="  m5-right p12-x p4-y fs-12 br-5 text-white"
            style={{ backgroundColor: "#ff7512" }}
            // onClick={() => handlePendingOpenDialogue(row)}
          >
            Pending
          </button>
        ) : row?.status === 2 ? (
          <button className="bg-info text-white m5-right p12-x p4-y fs-12 br-5 ">
            Confirm
          </button>
        ) : row?.status === 3 ? (
          <button
            className="bg-success text-white m5-right p12-x p4-y fs-12 br-5 "
            // onClick={() => handleCompletedDialogue(row)}
          >
            Completed
          </button>
        ) : row?.status === 4 ? (
          <button
            className="bg-danger text-white m5-right p12-x p4-y fs-12 br-5 "
            style={{ cursor: "pointer" }}
            // onClick={() => handleOpenDialogue(row)}
          >
            Cancel
          </button>
        ) : (
          ""
        ),
    },

    {
      Header: "Date",
      Cell: ({ row }: { row: userBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.date}</span>
      ),
    },
  ];
  return (
    <div className="mainCategory">
      {/* <Title name={`${bookingUserName} ' Appointment`} /> */}

      <div>
        <Table
          type={"server"}
          data={booking}
          mapData={bookingTable}
          serverPerPage={rowPerPage}
          Page={page}
        />
      </div>
    </div>
  );
}

UserBooking.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
