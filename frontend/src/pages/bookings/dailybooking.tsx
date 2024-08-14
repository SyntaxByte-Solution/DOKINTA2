import React, { useEffect, useState } from "react";
import RootLayout from "@/component/layout/Layout";
import Title from "@/extra/Title";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getDailyBooking } from "@/store/bookingSlice";
import Table from "@/extra/Table";
import Analytics from "@/extra/Analytic";

interface dailyBookingData {
  date: string;
  doctor: number;
  totalAmount?: number;
  doctorEarning?: number;
  totalTax?: number;
  adminEarning?: number;
}

export default function DailyBooking() {
  const [page, setPage] = useState<any>(0);
  const [rowsPerPage, setRowsPerPage] = useState<any>(0);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");

  const dispatch = useAppDispatch();

  useEffect(() => {
    let payload: any = {
      startDate: startDate,
      endDate: endDate,
    };

    dispatch(getDailyBooking(payload));
  }, [dispatch, startDate, endDate]);

  const dailyBooking = useSelector(
    (state: RootStore) => state?.booking?.calendarData
  );
  console.log("dailyBooking", dailyBooking);

  const dailyBookingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Date",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.date}</span>
      ),
    },

    {
      Header: "No Of Doctor",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.doctor}</span>
      ),
    },

    {
      Header: "DoctorEarning",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.doctorEarning}
        </span>
      ),
    },

    {
      Header: "TotalTax",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">{row?.totalTax}</span>
      ),
    },

    {
      Header: "AdminEarning",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.adminEarning}
        </span>
      ),
    },

    {
      Header: "TotalAmount",
      Cell: ({ row }: { row: dailyBookingData }) => (
        <span className="text-capitalize fw-bold cursor">
          {row?.totalAmount}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name="Bookings" />
      <Analytics
        analyticsStartDate={startDate}
        analyticsStartEnd={endDate}
        analyticsStartDateSet={setStartDate}
        analyticsStartEndSet={setEndDate}
      />
      <Table
        type={"server"}
        data={dailyBooking}
        mapData={dailyBookingTable}
        serverPerPage={rowsPerPage}
        Page={page}
      />
    </div>
  );
}

DailyBooking.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};
