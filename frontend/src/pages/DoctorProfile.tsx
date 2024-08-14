import React, { useEffect, useState } from "react";
import RootLayout from "../component/layout/Layout";
import Title from "@/extra/Title";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ExInput, Textarea } from "@/extra/Input";
import { useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import { RootStore, useAppDispatch } from "@/store/store";
import { getDoctorProfile, getDoctorReview } from "@/store/doctorSlice";
import { warning } from "@/utils/Alert";
import { useRouter } from "next/router";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";

interface DoctorService {
  _id: string;
  name: string;
  image: string;
  description: string;
}


const DoctorProfile = () => {
  const { doctorProfile, doctorReview } = useSelector((state: RootStore) => state.doctor);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  //   const { setting } = useSelector((state) => state.setting);
  //   const hasPermission = useSelector((state) => state.auth.admin.flag);
  const loader = useSelector(isLoading);
  const router = useRouter();
  const id: any = router?.query?.id;

  // const { doctorId } = router;

  console.log("doctorId", id);
  console.log('doctorReview', doctorReview)

  //   const state = useLocation();

  const [type, setType] = useState<string>("address");
  const [data, setData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);

  const dispatch = useAppDispatch();

  console.log('serviceData', serviceData)

  useEffect(() => {

    const payload = {
      start: page,
      limit: rowsPerPage,
      id
    }

    dispatch(getDoctorProfile(id));
    dispatch(getDoctorReview(payload))
  }, [dispatch, id]);

  useEffect(() => {
    if (doctorProfile) {
      //   setData();
    } else {
      //   setData();
    }
  }, []);

  //   useEffect(() => {
  //     if (doctorProfile?.serviceIds) {
  //       setServiceData(doctorProfile?.serviceIds);
  //     } else {
  //       setServiceData();
  //     }
  //   }, [doctorProfile?.serviceIds]);

  console.log("type+++", type);
  console.log("doctorProfiledoctorProfile+++", doctorProfile);

  const handleDelete = async (id: any) => {
    // if (!hasPermission) return permissionError();
    try {
      const data = await warning("Delete");
      const yes = data?.isConfirmed;
      console.log("yes", yes);
      if (yes) {
        // dispatch(salonReviewDelete(id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const iframeData = document.getElementById("iframeId");

    if (iframeData) {
      // iframeData.src = `https://maps.google.com/maps?q=${doctorProfile?.locationCoordinates?.latitude},${doctorProfile?.locationCoordinates?.longitude}&hl=es;&output=embed`;
    }
  }, []);

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const serviceTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span>{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Service Name",
      Cell: ({ row }: { row: DoctorService }) => (
        <span className="text-capitalize fw-bold">{row?.name}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }: { row: DoctorService }) => (
        <div className="userProfile">
          <img
            src={row && row.image}
            style={{ height: "70px", width: "70px", overflow: "hidden" }}
            alt="salon"
            className="cursor-pointer"
            height={`100%`}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-3">
        <Title
          name={`${doctorProfile?.name ? doctorProfile?.name : " "
            }'s   Profile`}
        />
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-4 col-md-6 col-12">
                {loader === true ? (
                  <>
                    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                      <p className="d-flex justify-content-center ">
                        <Skeleton
                          height={380}
                          width={380}
                          style={{
                            height: "380px",
                            width: "380px",
                            objectFit: "cover",
                            boxSizing: "border-box",
                            borderRadius: "30px",
                          }}
                        />
                      </p>
                    </SkeletonTheme>
                  </>
                ) : (
                  <img
                    src={doctorProfile?.image}
                    className="img-fluid"
                    style={{
                      height: "380px",
                      width: "380px",
                      objectFit: "cover",
                      boxSizing: "border-box",
                      borderRadius: "30px",
                    }}
                    alt=""
                  />
                )}
              </div>
              <div className="col-lg-8 col-md-6 col-12">
                <div className="row">
                  <div className="col-md-4">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={40}
                              width={250}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <ExInput
                        id={`doctorName`}
                        name={`doctorName`}
                        value={doctorProfile?.name}
                        label={`Doctor Name`}
                        placeholder={`doctorName`}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="col-md-4">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={40}
                              width={250}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <ExInput
                        id={`email`}
                        name={`email`}
                        value={doctorProfile?.email}
                        label={`Email`}
                        placeholder={`email`}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="col-md-4">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={40}
                              width={250}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <ExInput
                        id={`charge`}
                        name={`charge`}
                        value={
                          doctorProfile?.charge ? doctorProfile?.charge : ""
                        }
                        label={`Charge ($)`}
                        placeholder={`Charge`}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="col-md-4">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={40}
                              width={250}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <ExInput
                        type={`number`}
                        id={`mobileNumber`}
                        name={`mobileNumber`}
                        value={doctorProfile?.mobile}
                        label={`Mobile Number`}
                        placeholder={`mobileNumber`}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="col-md-4">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={40}
                              width={250}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <ExInput
                        id={`latitude`}
                        name={`latitude`}
                        value={doctorProfile?.locationCoordinates?.latitude}
                        label={`Latitude`}
                        placeholder={`latitude`}
                        readOnly
                      />
                    )}
                  </div>
                  <div className="col-md-4">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={40}
                              width={250}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <ExInput
                        id={`latitude`}
                        name={`latitude`}
                        value={doctorProfile?.locationCoordinates?.longitude}
                        label={`Longitude`}
                        placeholder={`latitude`}
                        readOnly
                      />
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    {loader === true ? (
                      <>
                        <SkeletonTheme
                          baseColor="#e2e5e7"
                          highlightColor="#fff"
                        >
                          <p className="d-flex justify-content-center my-3">
                            <Skeleton
                              height={150}
                              width={850}
                              style={{
                                borderRadius: "10px",
                              }}
                            />
                          </p>
                        </SkeletonTheme>
                      </>
                    ) : (
                      <>
                        <div className="inputData number  flex-row justify-content-start text-start">
                          <label>About Doctor</label>
                        </div>
                        <Textarea
                          row={5}
                          value={doctorProfile?.about}
                          readOnly
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="my-2"
              style={{
                width: "313px",
                border: "1px solid #1c2b20",
                padding: "4px",
                borderRadius: "40px",
              }}
            >
              <button
                type="button"
                className={`${type === "address" ? "activeBtn" : "disabledBtn"
                  }`}
                onClick={() => setType("address")}
              >
                Address
              </button>
              <button
                type="button"
                className={`${type === "review" ? "activeBtn" : "disabledBtn"
                  } ms-1`}
                onClick={() => setType("review")}
              >
                Review
              </button>
              <button
                type="button"
                className={`${type === "service" ? "activeBtn" : "disabledBtn"
                  } ms-1`}
                onClick={() => setType("service")}
              >
                Services
              </button>
            </div>
            {type === "address" && (
              <div className="row">
                <div className="col-lg-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={400}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`address`}
                      name={`address`}
                      value={doctorProfile?.addressDetails?.addressLine1}
                      label={`Address`}
                      placeholder={`address`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-lg-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={400}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`landmark`}
                      name={`landmark`}
                      value={doctorProfile?.addressDetails?.landMark}
                      label={`LandMark`}
                      placeholder={`landmark`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-lg-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={400}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`city`}
                      name={`city`}
                      value={doctorProfile?.addressDetails?.city}
                      label={`City`}
                      placeholder={`city`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-lg-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={400}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`state`}
                      name={`state`}
                      value={doctorProfile?.addressDetails?.state}
                      label={`State`}
                      placeholder={`state`}
                      readOnly
                    />
                  )}
                </div>
                <div className="col-lg-4">
                  {loader === true ? (
                    <>
                      <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
                        <p className="d-flex justify-content-center my-3">
                          <Skeleton
                            height={40}
                            width={400}
                            style={{
                              borderRadius: "10px",
                            }}
                          />
                        </p>
                      </SkeletonTheme>
                    </>
                  ) : (
                    <ExInput
                      id={`country`}
                      name={`country`}
                      value={doctorProfile?.addressDetails?.country}
                      label={`Country`}
                      placeholder={`country`}
                      readOnly
                    />
                  )}
                </div>
                <div>
                  <label className="fw-bold mb-2">Map</label>
                  <iframe
                    id="iframeId"
                    height="500px"
                    title="doctorLocation"
                    width="100%"
                  ></iframe>
                </div>
              </div>
            )}


            {/* {/* {type === "review" && <Table data={data} mapData={reviewTable} />} */}
            {type === "review" && (

              <>
                <div className="row bg-white">
                  <div className="col-lg-6 col-md-12 ">
                    <div className="m40-top tsBox p-3 br-2">
                      <h5 className="text-center text-theme">Review</h5>
                      {/* <Table
                     data={doctorProfile?.services}
                    //  mapData={topDoctorData}
                     className="border-0"
                   /> */}
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="m40-top tsBox p-3 br-2">
                      <h5 className="text-center text-theme">Services</h5>
                      <Table
                        data={doctorProfile?.service}
                        mapData={serviceTable}
                        className="border-0"
                        PerPage={rowsPerPage}
                        Page={page}
                        type={"client"}
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
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
DoctorProfile.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default DoctorProfile;
