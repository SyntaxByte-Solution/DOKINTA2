import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { RootStore, useAppDispatch } from "@/store/store";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";





interface ComaplainTable {
  _id: string;
  user: any;
  doctor: any;
  appointmentId: string;
  details: string;
  expiryDate: string;
  discountPercent: number;
  minAmountToApply: number;
  isActive: false;
  maxDiscount: number;
  createdAt : string
}

const DoctorComplain = () => {
  const dispatch = useAppDispatch();
  const hasPermission = useSelector(
    (state: RootStore) => state.admin.permission
  );


  const { doctorPendingComplain, doctorSolvedComplain } = useSelector(
    (state: RootStore) => state.complain
  );
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );
  const [type, setType] = useState<string>("pending");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [data, setData] = useState<any[]>([]);
  const [data1, setData1] = useState<any[]>([]);

  useEffect(() => {
    setData(doctorPendingComplain);
  }, [doctorPendingComplain]);

  useEffect(() => {
    setData1(doctorSolvedComplain);
  }, [doctorSolvedComplain]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const doctorPendingComplainTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
   
    {
      Header: "Doctor",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.doctor?.name ? row?.doctor?.name : "-"}
        </span>
      ),
    },
    {
      Header: "Appointment Id",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize fw-bold">{row?.appointmentId}</span>
      ),
    },
    {
      Header: "Description",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize">{row?.details}</span>
      ),
    },

    {
      Header: "CreatedAt",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.createdAt?.split("T")[0]}
        </span>
      ),
    },

    // {
    //   Header: "Action",
    //   Cell: ({ row }) => (
    //     <span>
    //       <button
    //         className="py-1 me-3"
    //         style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
    //       // onClick={() =>
    //       //   dispatch(openDialog({ type: "suggestedService", data: row }))
    //       // }
    //       >
    //         <svg
    //           width="24"
    //           height="24"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           <path
    //             d="M11.9999 21.4286C17.2071 21.4286 21.4284 17.2072 21.4284 12C21.4284 6.79273 17.2071 2.57141 11.9999 2.57141C6.7926 2.57141 2.57129 6.79273 2.57129 12C2.57129 17.2072 6.7926 21.4286 11.9999 21.4286Z"
    //             fill="#00A1F6"
    //             stroke="#00A1F6"
    //             stroke-width="2.48008"
    //           />
    //           <path
    //             d="M10.17 13.5432L8.22373 11.5969C7.86321 11.2364 7.26813 11.2364 6.90762 11.5969C6.5471 11.9574 6.5471 12.5525 6.90762 12.913L9.51191 15.5173C9.51193 15.5173 9.51195 15.5174 9.51197 15.5174C9.68642 15.692 9.92307 15.7902 10.1699 15.7905L10.1701 15.7905C10.417 15.7902 10.6536 15.692 10.8281 15.5174C10.8281 15.5174 10.8281 15.5173 10.8281 15.5173L16.026 10.3194C16.3866 9.95892 16.3866 9.36384 16.026 9.00332C15.6655 8.6428 15.0704 8.6428 14.7099 9.00332L10.17 13.5432Z"
    //             fill="white"
    //             stroke="white"
    //             stroke-width="0.248008"
    //           />
    //         </svg>
    //       </button>
    //       <button
    //         className="py-1"
    //         style={{ backgroundColor: "#FFF1F1", borderRadius: "8px" }}
    //       // onClick={() => handleDecline(row?._id)}
    //       >
    //         <svg
    //           width="24"
    //           height="24"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           <path
    //             d="M12.0003 21.4286C17.2076 21.4286 21.4289 17.2072 21.4289 12C21.4289 6.79273 17.2076 2.57141 12.0003 2.57141C6.79309 2.57141 2.57178 6.79273 2.57178 12C2.57178 17.2072 6.79309 21.4286 12.0003 21.4286Z"
    //             fill="#F90008"
    //             stroke="#F90008"
    //             stroke-width="2.48008"
    //           />
    //           <path
    //             d="M15.1436 8.85696L8.85794 15.1426M8.85791 8.85693L15.1436 15.1426"
    //             stroke="white"
    //             stroke-width="2.14286"
    //             stroke-linecap="round"
    //           />
    //         </svg>
    //       </button>
    //     </span>
    //   ),
    // },
  ];
  const doctorSolvedComplainTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Doctor",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.doctor?.name ? row?.doctor?.name : "-"}
        </span>
      ),
    },
    {
      Header: "Appointment Id",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize fw-bold">{row?.appointmentId}</span>
      ),
    },
    {
      Header: "Description",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize">{row?.details}</span>
      ),
    },

    {
      Header: "CreatedAt",
      Cell: ({ row }: { row: ComaplainTable }) => (
        <span className="text-capitalize fw-bold">
          {row?.createdAt?.split("T")[0]}
        </span>
      ),
    },
    // {
    //   Header: "Action",
    //   Cell: ({ row }) => (
    //     <span>
    //       <button
    //         className="py-1 me-3"
    //         style={{ backgroundColor: "#CFF3FF", borderRadius: "8px" }}
    //       // onClick={() =>
    //       //   dispatch(openDialog({ type: "suggestedService", data: row }))
    //       // }
    //       >
    //         <svg
    //           width="24"
    //           height="24"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           <path
    //             d="M11.9999 21.4286C17.2071 21.4286 21.4284 17.2072 21.4284 12C21.4284 6.79273 17.2071 2.57141 11.9999 2.57141C6.7926 2.57141 2.57129 6.79273 2.57129 12C2.57129 17.2072 6.7926 21.4286 11.9999 21.4286Z"
    //             fill="#00A1F6"
    //             stroke="#00A1F6"
    //             stroke-width="2.48008"
    //           />
    //           <path
    //             d="M10.17 13.5432L8.22373 11.5969C7.86321 11.2364 7.26813 11.2364 6.90762 11.5969C6.5471 11.9574 6.5471 12.5525 6.90762 12.913L9.51191 15.5173C9.51193 15.5173 9.51195 15.5174 9.51197 15.5174C9.68642 15.692 9.92307 15.7902 10.1699 15.7905L10.1701 15.7905C10.417 15.7902 10.6536 15.692 10.8281 15.5174C10.8281 15.5174 10.8281 15.5173 10.8281 15.5173L16.026 10.3194C16.3866 9.95892 16.3866 9.36384 16.026 9.00332C15.6655 8.6428 15.0704 8.6428 14.7099 9.00332L10.17 13.5432Z"
    //             fill="white"
    //             stroke="white"
    //             stroke-width="0.248008"
    //           />
    //         </svg>
    //       </button>
    //       <button
    //         className="py-1"
    //         style={{ backgroundColor: "#FFF1F1", borderRadius: "8px" }}
    //       // onClick={() => handleDecline(row?._id)}
    //       >
    //         <svg
    //           width="24"
    //           height="24"
    //           viewBox="0 0 24 24"
    //           fill="none"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           <path
    //             d="M12.0003 21.4286C17.2076 21.4286 21.4289 17.2072 21.4289 12C21.4289 6.79273 17.2076 2.57141 12.0003 2.57141C6.79309 2.57141 2.57178 6.79273 2.57178 12C2.57178 17.2072 6.79309 21.4286 12.0003 21.4286Z"
    //             fill="#F90008"
    //             stroke="#F90008"
    //             stroke-width="2.48008"
    //           />
    //           <path
    //             d="M15.1436 8.85696L8.85794 15.1426M8.85791 8.85693L15.1436 15.1426"
    //             stroke="white"
    //             stroke-width="2.14286"
    //             stroke-linecap="round"
    //           />
    //         </svg>
    //       </button>
    //     </span>
    //   ),
    // },
  ];
  return (
    <>
      <>
        <div className="row p-0">
          <div className="col-2">
            <div className="inputData">
              <label className="styleForTitle" htmlFor="complainType">
                Select Type
              </label>
              <select
                name="complainType"
                className="rounded-2 fw-bold mt-2"
                id="complainType"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
              >
                <option key="Pending" value="pending">
                  Pending
                </option>
                <option key="Solved" value="solved">
                  Solved
                </option>
              </select>
            </div>
          </div>
        </div>
        <div>
          {type === "pending" && (
            <>
              <Table
                type={"client"}
                data={data}
                mapData={doctorPendingComplainTable}
                PerPage={rowsPerPage}
                Page={page}
              />
              <Pagination
                type={"client"}
                serverPage={page}
                setServerPage={setPage}
                serverPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                totalData={data?.length}
              />
            </>
          )}

          {type === "solved" && (
            <>
              <Table
                type={"client"}
                data={data1}
                mapData={doctorSolvedComplainTable}
                PerPage={rowsPerPage}
                Page={page}
              />
              <Pagination
                type={"client"}
                serverPage={page}
                setServerPage={setPage}
                serverPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                totalData={data1?.length}
              />
            </>
          )}
        </div>
      </>
    </>
  );
};

export default DoctorComplain;
