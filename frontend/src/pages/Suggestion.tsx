import React, { useEffect, useState } from "react";
import RootLayout from "@/component/layout/Layout";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import {
  getDoctorSuggestion,
  getUserSuggestion,
} from "@/store/suggestionSlice";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import Title from "@/extra/Title";

interface suggestion {
  doctor: {
    name?: string;
  };

  user: {
    name: string;
  };

  details?: string;
  createdAt?: string;
}

const Suggestion = () => {
  const dispatch = useAppDispatch();
  const suggestion = useSelector((state: RootStore) => state.suggestion);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(0);
  const [type, setType] = useState<number>(1);

  console.log("suggestion", suggestion);

  useEffect(() => {
    // const payload = {
    //   type
    // }

    dispatch(getUserSuggestion());
    dispatch(getDoctorSuggestion());
  }, [dispatch]);

  const handleChangePage = (newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const suggestionDoctorTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Doctor Name",
      Cell: ({ row }: { row: suggestion }) => (
        <span className="text-capitalize fw-bold">{row?.doctor?.name}</span>
      ),
    },
    {
      Header: "Details",
      Cell: ({ row }: { row: suggestion }) => (
        <span className="text-capitalize fw-bold">{row?.details}</span>
      ),
    },
    {
      Header: "CreatedAt",
      Cell: ({ row }: { row: suggestion }) => (
        <span className="text-capitalize fw-bold">
          {row?.createdAt?.split("T")[0]}
        </span>
      ),
    },
  ];

  const suggestionUserTabel = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Doctor Name",
      Cell: ({ row }: { row: suggestion }) => (
        <span className="text-capitalize fw-bold">{row?.user?.name}</span>
      ),
    },
    {
      Header: "Details",
      Cell: ({ row }: { row: suggestion }) => (
        <span className="text-capitalize fw-bold">{row?.details}</span>
      ),
    },
    {
      Header: "CreatedAt",
      Cell: ({ row }: { row: suggestion }) => (
        <span className="text-capitalize fw-bold">
          {row?.createdAt ? row?.createdAt?.split("T")[0] : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="mainCategory">
      <Title name="Suggestion" />
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
          className={`${type === 2 ? "activeBtn" : "disabledBtn"}`}
          onClick={() => setType(2)}
        >
          User
        </button>
        <button
          type="button"
          className={`${type === 1 ? "activeBtn" : "disabledBtn"} ms-1`}
          onClick={() => setType(1)}
        >
          Doctor
        </button>
      </div>
      <div>
        {type == 1 ? (
          <Table
            data={suggestion?.doctorSuggestion}
            mapData={suggestionDoctorTable}
            PerPage={rowsPerPage}
            Page={page}
            type={"client"}
          />
        ) : (
          <Table
            data={suggestion?.userSuggestion}
            mapData={suggestionUserTabel}
            PerPage={rowsPerPage}
            Page={page}
            type={"client"}
          />
        )}

        <Pagination
          type={"client"}
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          // totalData={}
        />
      </div>
    </div>
  );
};

Suggestion.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Suggestion;
