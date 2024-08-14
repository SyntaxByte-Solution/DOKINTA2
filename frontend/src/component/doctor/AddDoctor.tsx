import Button from "@/extra/Button";
import { ExInput, FormInput, Textarea } from "@/extra/Input";
import Title from "@/extra/Title";
import { RootStore, useAppDispatch } from "@/store/store";
import { permissionError } from "@/utils/Alert";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReactDropzone from "react-dropzone";
import { closeDialog } from "@/store/dialogSlice";
import Image from "next/image";
import { updateDoctor } from "@/store/doctorSlice";

interface ErrorState {
  name: string;
  email: string;
  address: string;
  country: string;
  password: string;
  mobile: string;
  dob: string;
  commission: string;
  // latitude: string;
  // longitude: string;
  images: string;
  gender: string;
  age: string;
  clinicName: string;
  charge: string;
  education: string;
  experienceDetails: string;
  experience: string;
  yourSelf: string;
  designation: string;
  language: string;
  awards: string;
  degree: string;
  image: string;
  upiId: string;
  bankName: string;
  accountNumber: string;
  IFSCCode: string;
  branchName: string;
}

const AddDoctor = () => {
  const hasPermission = useSelector(
    (state: RootStore) => state.admin.permission
  );

  console.log("hasPermission", hasPermission);
  const { dialogueData } = useSelector((state: any) => state.dialogue);
  const dispatch = useAppDispatch();

  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [mobile, setMobile] = useState<any>();
  const [gender, setGender] = useState<any>();
  const [age, setAge] = useState<any>();
  const [address, setAddress] = useState<string>();
  const [country, setCountry] = useState<string>();
  const [commission, setCommission] = useState<any>();
  const [charge, setCharge] = useState<any>();
  // const [latitude, setLatitude] = useState<any>();
  // const [longitude, setLongitude] = useState<any>();
  const [clinicName, setClinicName] = useState<string>();
  const [education, setEducation] = useState<string>();
  const [experienceDetails, setExperienceDetails] = useState<string>();
  const [experience, setExperience] = useState<any>();
  const [yourSelf, setYourSelf] = useState<string>();
  const [designation, setDesignation] = useState<string>();
  const [dob, setDob] = useState<string>();
  const [language, setLanguage] = useState<string>();
  const [awards, setAwards] = useState<string>();
  const [degree, setDegree] = useState<string>();
  const [image, setImage] = useState<any>();
  const [imagePath, setImagePath] = useState<any>();
  const [upiId, setUpiId] = useState<string>();

  const [bankName, setBankName] = useState<string>();
  const [accountNumber, setAccountNumber] = useState<any>();
  const [IFSCCode, setIFSCCode] = useState<string>();
  const [branchName, setBranchName] = useState<string>();

  const [error, setError] = useState({
    name: "",
    email: "",
    address: "",
    country: "",
    mobile: "",
    commission: "",
    // latitude: "",
    // longitude: "",
    password: "",
    gender: "",
    age: "",
    clinicName: "",
    charge: "",
    education: "",
    experience: "",
    experienceDetails: "",
    yourSelf: "",
    designation: "",
    dob: "",
    language: "",
    awards: "",
    degree: "",
    image: "",
    upiId: "",
    bankName: "",
    accountNumber: "",
    IFSCCode: "",
    branchName: "",
  });

  useEffect(() => {
    setName(dialogueData?.name);
    setEmail(dialogueData?.email);
    setPassword(dialogueData?.password);
    setMobile(dialogueData?.mobile);
    setGender(dialogueData?.gender);
    setAge(dialogueData?.age);
    setAddress(dialogueData?.address);
    setCountry(dialogueData?.country);
    setCommission(dialogueData?.commission);
    setCharge(dialogueData?.charge);
    // setLatitude(dialogueData?.latitude);
    // setLongitude(dialogueData?.longitude);
    setClinicName(dialogueData?.clinicName);
    setEducation(dialogueData?.education);
    setExperienceDetails(dialogueData?.experienceDetails);
    setExperience(dialogueData?.experience);
    setYourSelf(dialogueData?.yourSelf);
    setDesignation(dialogueData?.designation);
    setDob(dialogueData?.dob);
    setLanguage(dialogueData?.language);
    setAwards(dialogueData?.awards);
    setDegree(dialogueData?.degree);
    setImagePath(dialogueData?.image);
    setUpiId(dialogueData?.upiId);
    setBankName(dialogueData?.bankDetails?.bankName);
    setAccountNumber(dialogueData?.bankDetails?.accountNumber);
    setIFSCCode(dialogueData?.bankDetails?.IFSCCode);
    setBranchName(dialogueData?.bankDetails?.branchName);
  }, [dialogueData]);

  const handleInputImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setImage(e?.target?.files[0]);
      console.log("e.target.files[0]", e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError({ ...error, image: "" });
    }
  };
  const handleSubmit = (e: any) => {
    // if (!hasPermission) return permissionError();
    if (
      !name ||
      !email ||
      !password ||
      !mobile ||
      !address ||
      !country ||
      // !latitude ||
      // !longitude ||
      !commission ||
      !gender ||
      !age ||
      !clinicName ||
      !charge ||
      !education ||
      !experience ||
      !experienceDetails ||
      !yourSelf ||
      !designation ||
      !dob ||
      !language ||
      !awards ||
      !degree ||
      !image ||
      !upiId ||
      !bankName ||
      !accountNumber ||
      !branchName ||
      !IFSCCode ||
      accountNumber < 0
    ) {
      let error = {} as ErrorState;
      if (!name) error.name = "Name is required";
      if (!email) error.email = "Email is required";
      if (!password) error.password = "Password is required";
      if (!mobile) error.mobile = "Mobile number is required";
      if (!gender) error.gender = "Gender is required";
      if (!address) error.address = "Address is required";
      if (!commission) error.commission = "Commision is required";
      if (!charge) error.charge = "Charge is required";
      if (!country) error.country = "Country is required";
      // if (!latitude) error.latitude = "Latitude is required";
      // if (!longitude) error.longitude = "Longitude is required";
      if (!age) error.age = "Age is required";
      if (!clinicName) error.clinicName = "Clinic name is required";
      if (!education) error.education = "Eduction is required";
      if (!experience) error.experience = "Experience is required";
      if (!experienceDetails)
        error.experienceDetails = "Experience details is required";
      if (!yourSelf) error.yourSelf = "Yourself is required";
      if (!designation) error.designation = "Designation is required";
      if (!dob) error.dob = "Date of birth is required";
      if (!language) error.language = "Language is required";
      if (!awards) error.awards = "Awards is required";
      if (!degree) error.degree = "Degree is required";
      if (!image) error.image = "Image is required";
      if (!upiId) error.upiId = "Upi Id is required";
      if (!bankName) error.bankName = "Bank Name Is Required ";
      if (!accountNumber) error.accountNumber = "Account Number Is Required ";
      if (accountNumber < 0)
        error.accountNumber = "Invalid Account Number !... ";
      if (!IFSCCode) error.IFSCCode = "IFSC Code Is Required ";
      if (!branchName) error.branchName = "Branch Name Is Required ";
      return setError({ ...error });
    } else {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("commission", commission);
      formData.append("charge", charge);
      formData.append("country", country);
      formData.append("gender", gender);
      formData.append("age", age);
      formData.append("mobile", mobile);
      formData.append("clinicName", clinicName);
      formData.append("education", education);
      formData.append("password", password);
      formData.append("experience", experience);
      formData.append("experienceDetails", experienceDetails);
      formData.append("yourSelf", yourSelf);
      formData.append("designation", designation);
      formData.append("dob", dob);
      formData.append("language", language);
      formData.append("awards", awards);
      formData.append("degree", degree);
      formData.append("image", image);
      formData.append("upiId", upiId);
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("IFSCCode", IFSCCode);
      formData.append("branchName", branchName);
      // formData.append("latitude", latitude);
      // formData.append("longitude", longitude);

      // if (!hasPermission) return permissionError();

      let payload: any = { doctorId: dialogueData?._id, data: formData };
      dispatch(updateDoctor(payload));

      dispatch(closeDialog());
    }
  };

  return (
    <div className="p-3">
      <Title name={`Update Doctor`} />
      <div className="card">
        <div className="card-body">
          <div className="">
            <div className="row align-items-start formBody">
              <div className="col-12">
                <h2 className="fw-bolder mb-0" style={{ fontSize: "22px" }}>
                  Doctor Information
                </h2>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`name`}
                  name={`name`}
                  value={name}
                  label={`Name`}
                  defaultValue={dialogueData && dialogueData?.name}
                  placeholder={`Name`}
                  errorMessage={error.name && error.name}
                  onChange={(e: any) => {
                    setName(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        name: ` Name is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        name: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`email`}
                  name={`email`}
                  value={email}
                  label={`email`}
                  defaultValue={dialogueData && dialogueData?.email}
                  placeholder={`email`}
                  errorMessage={error.email && error.email}
                  onChange={(e: any) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `Email is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        email: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`password`}
                  id={`password`}
                  name={`password`}
                  value={password}
                  label={`Password`}
                  defaultValue={dialogueData && dialogueData?.password}
                  placeholder={`Password`}
                  errorMessage={error.password && error.password}
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        password: `Password is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        password: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  value={mobile}
                  id={`mono`}
                  name={`mobile`}
                  label={`Mobile number`}
                  defaultValue={dialogueData && dialogueData?.mobile}
                  minLength={6}
                  maxLength={13}
                  placeholder={`Mobile number`}
                  errorMessage={error.mobile && error.mobile}
                  onChange={(e: any) => {
                    setMobile(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        mobile: `Mobile number is required`,
                      });
                    } else if (
                      e.target.value.length < 6 ||
                      e.target.value.length > 13
                    ) {
                      return setError({
                        ...error,
                        mobile: "Mobile number must be 6 to 13 digits",
                      });
                    } else {
                      return setError({
                        ...error,
                        mobile: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`age`}
                  name={`age`}
                  value={age}
                  label={`Age`}
                  defaultValue={dialogueData && dialogueData?.age}
                  placeholder={`age`}
                  errorMessage={error.age && error.age}
                  onChange={(e: any) => {
                    setAge(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        age: `Age is required`,
                      });
                    } else if (e.target.value.length > 2) {
                      return setError({
                        ...error,
                        age: "Age must be 2 digits",
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        age: "Age must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        age: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`charge`}
                  name={`charge`}
                  value={charge}
                  label={`Charge (₹)`}
                  placeholder={`Charge`}
                  defaultValue={dialogueData && dialogueData?.charge}
                  errorMessage={error.charge && error.charge}
                  onChange={(e: any) => {
                    setCharge(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        charge: `Charge is required`,
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        charge: "Charge must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        charge: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`commission`}
                  name={`commission`}
                  value={commission}
                  label={`Commission (%)`}
                  defaultValue={dialogueData && dialogueData?.commission}
                  placeholder={`Commission`}
                  errorMessage={error.commission && error.commission}
                  onChange={(e: any) => {
                    setCommission(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        commission: `Commission is required`,
                      });
                    } else if (e.target.value.length > 2) {
                      return setError({
                        ...error,
                        commission: "Commission must be 2 digits",
                      });
                    } else if (e.target.value < 0) {
                      return setError({
                        ...error,
                        commission: "Commission must be negative value",
                      });
                    } else {
                      return setError({
                        ...error,
                        commission: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`clinicName`}
                  name={`clinicName`}
                  value={clinicName}
                  label={`Clinic Name`}
                  defaultValue={dialogueData && dialogueData?.clinicName}
                  placeholder={`Clinic Name`}
                  errorMessage={error.clinicName && error.clinicName}
                  onChange={(e: any) => {
                    setClinicName(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        clinicName: `ClinicName is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        clinicName: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <div
                  className={`inputData flex-row justify-content-start text-start`}
                >
                  <label htmlFor="gender">Date Of Birth</label>
                  <input
                    type={`date`}
                    id={`dob`}
                    name={`dob`}
                    value={dob}
                    defaultValue={dialogueData && dialogueData?.dob}
                    placeholder={`Date of Birth`}
                    onChange={(e: any) => {
                      setDob(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          dob: `Date of birth is required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          dob: "",
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={"file"}
                  label={"Image"}
                  accept={"image/png, image/jpeg"}
                  errorMessage={error.image && error.image}
                  onChange={handleInputImage}
                />

                {imagePath && (
                  <>
                    <img
                      src={imagePath ? imagePath : dialogueData?.image}
                      className="mt-3 rounded float-left mb-2"
                      alt="image"
                      style={{ width: "100px", height: "100px" }}
                    />
                  </>
                )}
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <div
                  className={`inputData flex-row justify-content-start text-start`}
                >
                  <label htmlFor="gender">Select Gender</label>
                </div>
                <div className="d-flex align-items-center pt-2">
                  <FormInput
                    type={`radio`}
                    name={`genders`}
                    value={`male`}
                    id={`male`}
                    label={`Male`}
                    defaultValue={dialogueData && dialogueData?.gender}
                    checked={gender || dialogueData?.gender === "male"}
                    errorMessage={error.gender && error.gender}
                    onChange={(e: any) => {
                      setGender(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          gender: `Gender is required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          gender: "",
                        });
                      }
                    }}
                  />
                  <FormInput
                    type={`radio`}
                    name={`genders`}
                    value={`female`}
                    id={`female`}
                    label={`Female`}
                    defaultValue={dialogueData && dialogueData?.gender}
                    checked={gender || dialogueData?.gender === "female"}
                    errorMessage={error.gender && error.gender}
                    onChange={(e: any) => {
                      setGender(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          gender: `Gender is required`,
                        });
                      } else {
                        return setError({
                          ...error,
                          gender: "",
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-12">
                <h2 className="fw-bolder mb-0" style={{ fontSize: "22px" }}>
                  Address Information
                </h2>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`address`}
                  name={`Address`}
                  value={address}
                  label={`Address`}
                  placeholder={`Address`}
                  defaultValue={dialogueData && dialogueData?.address}
                  errorMessage={error.address && error.address}
                  onChange={(e: any) => {
                    setAddress(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        address: `Address is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        address: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`country`}
                  name={`country`}
                  value={country}
                  label={`Country`}
                  defaultValue={dialogueData && dialogueData?.country}
                  placeholder={`Country`}
                  errorMessage={error.country && error.country}
                  onChange={(e: any) => {
                    setCountry(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        country: `Country is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        country: "",
                      });
                    }
                  }}
                />
              </div>
              {/* <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`latitude`}
                  name={`latitude`}
                  value={latitude}
                  label={`latitude`}
                  placeholder={`latitude`}
                  defaultValue={dialogueData && dialogueData?.latitude}
                  errorMessage={error.latitude && error.latitude}
                  onChange={(e: any) => {
                    setLatitude(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        latitude: `latitude is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        latitude: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`longitude`}
                  name={`longitude`}
                  value={longitude}
                  label={`longitude`}
                  placeholder={`longitude`}
                  defaultValue={dialogueData && dialogueData?.longitude}
                  errorMessage={error.longitude && error.longitude}
                  onChange={(e: any) => {
                    setLongitude(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        longitude: `longitude is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        longitude: "",
                      });
                    }
                  }}
                />
                <p style={{ fontSize: "15px" }}>
                  Get latitude and longitude in{" "}
                  <a href="https://www.latlong.net/" target="_blank">
                    https://www.latlong.net/
                  </a>
                </p>
              </div> */}

              <div className="col-12">
                <h2 className="fw-bolder mb-0" style={{ fontSize: "22px" }}>
                  Bank Information
                </h2>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  label={`Bank Name`}
                  placeholder={`Bank Name`}
                  id={`bankName`}
                  type={`text`}
                  value={bankName}
                  defaultValue={
                    dialogueData && dialogueData?.bankDetails?.bankName
                  }
                  errorMessage={error.bankName && error.bankName}
                  onChange={(e: any) => {
                    setBankName(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        bankName: `Bank Name is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        bankName: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  label={`Account Number`}
                  placeholder={`Account Number`}
                  id={`accountNumber`}
                  type={`number`}
                  value={accountNumber}
                  defaultValue={
                    dialogueData && dialogueData?.bankDetails?.accountNumber
                  }
                  errorMessage={error.accountNumber && error.accountNumber}
                  onChange={(e: any) => {
                    setAccountNumber(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        accountNumber: `Account Number is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        accountNumber: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  label={`Branch Name`}
                  placeholder={`Branch Name`}
                  id={`branchName`}
                  type={`branchName`}
                  value={branchName}
                  defaultValue={
                    dialogueData && dialogueData?.bankDetails?.branchName
                  }
                  errorMessage={error.branchName && error.branchName}
                  onChange={(e: any) => {
                    setBranchName(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        branchName: `Branch Name is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        branchName: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  label={`IFSC Code`}
                  placeholder={`IFSC Code`}
                  id={`IFSCCode`}
                  type={`text`}
                  value={IFSCCode}
                  defaultValue={
                    dialogueData && dialogueData?.bankDetails?.IFSCCode
                  }
                  errorMessage={error.IFSCCode && error.IFSCCode}
                  onChange={(e: any) => {
                    setIFSCCode(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        IFSCCode: `IFSCCode is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        IFSCCode: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`upiId`}
                  name={`upiId`}
                  value={upiId}
                  label={`UpiId`}
                  defaultValue={dialogueData && dialogueData?.upiId}
                  placeholder={`UpiId`}
                  errorMessage={error.upiId && error.upiId}
                  onChange={(e: any) => {
                    setUpiId(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        upiId: `UpiId is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        upiId: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12">
                <h2 className="fw-bolder mb-0" style={{ fontSize: "22px" }}>
                  Other Information
                </h2>
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`education`}
                  name={`education`}
                  value={education}
                  label={`Education`}
                  placeholder={`Education`}
                  defaultValue={dialogueData && dialogueData?.education}
                  errorMessage={error.education && error.education}
                  onChange={(e: any) => {
                    setEducation(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        education: `Education is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        education: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`number`}
                  id={`experience`}
                  name={`experience`}
                  value={experience}
                  defaultValue={dialogueData && dialogueData?.experience}
                  label={`Experience`}
                  placeholder={`Experience`}
                  errorMessage={error.experience && error.experience}
                  onChange={(e: any) => {
                    setExperience(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        experience: `Experience is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        experience: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`experienceDetails`}
                  name={`experienceDetails`}
                  value={experienceDetails}
                  defaultValue={dialogueData && dialogueData?.experienceDetails}
                  label={`Experience Details`}
                  placeholder={`Experience Details`}
                  errorMessage={
                    error.experienceDetails && error.experienceDetails
                  }
                  onChange={(e: any) => {
                    setExperienceDetails(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        experienceDetails: `Experience details is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        experienceDetails: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`yourSelf`}
                  name={`yourSelf`}
                  value={yourSelf}
                  label={`Your Self`}
                  defaultValue={dialogueData && dialogueData?.yourSelf}
                  placeholder={`Your Self`}
                  errorMessage={error.yourSelf && error.yourSelf}
                  onChange={(e: any) => {
                    setYourSelf(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        yourSelf: `Your Self is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        yourSelf: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`designation`}
                  name={`designation`}
                  value={designation}
                  label={`Designation`}
                  defaultValue={dialogueData && dialogueData?.designation}
                  placeholder={`Designation`}
                  errorMessage={error.designation && error.designation}
                  onChange={(e: any) => {
                    setDesignation(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        designation: `Designation is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        designation: "",
                      });
                    }
                  }}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`degree`}
                  name={`degree`}
                  value={degree}
                  label={`Degree`}
                  defaultValue={dialogueData && dialogueData?.degree}
                  placeholder={`Degree`}
                  errorMessage={error.degree && error.degree}
                  onChange={(e: any) => {
                    setDegree(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        degree: `Degree is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        degree: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`awards`}
                  name={`awards`}
                  value={awards}
                  defaultValue={dialogueData && dialogueData?.awards}
                  label={`Awards`}
                  placeholder={`Awards`}
                  errorMessage={error.awards && error.awards}
                  onChange={(e: any) => {
                    setAwards(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        awards: `Awards is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        awards: "",
                      });
                    }
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4">
                <ExInput
                  type={`text`}
                  id={`language`}
                  name={`language`}
                  value={language}
                  defaultValue={dialogueData && dialogueData?.language}
                  label={`Language`}
                  placeholder={`Language`}
                  errorMessage={error.language && error.language}
                  onChange={(e: any) => {
                    setLanguage(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        language: `Language is required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        language: "",
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="row  formFooter">
              <div className="col-12 text-end m0">
                <Button
                  className={`bg-gray text-light`}
                  text={`Cancel`}
                  type={`button`}
                  onClick={() => dispatch(closeDialog())}
                />
                <Button
                  type={`submit`}
                  className={` text-white m10-left`}
                  style={{ backgroundColor: "#1ebc1e" }}
                  text={`Submit`}
                  onClick={(e: any) => handleSubmit(e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDoctor;
