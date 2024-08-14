import Button from "@/extra/Button";
import { ExInput } from "@/extra/Input";
import { closeDialog } from "@/store/dialogSlice";
import { allUserNotification, expertNotification, userNotification } from "@/store/notificationSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import React, { useState } from "react";
import {useSelector } from "react-redux";

interface ErrorState {
  title: string;
  message: string;  
  image: String;

}
const NotificationDialog = () => {
  const dispatch = useAppDispatch();
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<any>([]);
  const [imagePath, setImagePath] = useState("");
  // const hasPermission = useSelector((state : RootStore) => state.auth.admin.flag);


  console.log('image', image)

  const [error, setError] = useState<any>({
    title: "",
    message: "",
    image: ""
  });


  const handleSubmit = (e: any) => {
    // if (!hasPermission) return permissionError();
    if (!title || !message) {
      let error = {} as ErrorState;
      if (!title) error.title = "Title is Required";
      if (!message) error.message = "Message is Required";
      return setError({ ...error });
    } else {
      ;
      if (image?.length !== 0) {

        let payload: any;
        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("image", image);

        debugger

        if (dialogueData.type === "user") {
          ;
          payload = {
            data: formData,
            userId: dialogueData.id,
          };
          dispatch(userNotification(payload)).unwrap();
        } else if (dialogueData.type === "expert") {
          ;
          payload = {
            data: formData,
            expertId: dialogueData.id,
          };
          dispatch(expertNotification(payload)).unwrap();
        }
      } else {
        let payload;
        ;
        if (dialogueData.type === "user") {

          payload = {
            data: {
              title,
              message,
            },
            userId: dialogueData.id,
          };

          dispatch(userNotification(payload)).unwrap();
        } else if (dialogueData.type === "expert") {
          payload = {
            data: {
              title,
              message,
            },
            expertId: dialogueData.id,
          };
          dispatch(expertNotification(payload)).unwrap();
        }
      }
      dispatch(closeDialog());
    }
  };

  const handleAllUser = (e: any) => {
    // if(!hasPermission) return permissionError();
    let payload;
    if (!title || !message) {
      let error = {} as ErrorState;
      if (!title) error.title = "Title is Required";
      if (!message) error.message = "Message is Required";
      return setError({ ...error });
    } else {
      if (image.length !== 0) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("message", message);
        formData.append("image", image);


        dispatch(allUserNotification(formData)).unwrap();
      } else {
        payload = {
          title,
          message,
        };
        dispatch(allUserNotification(payload)).unwrap();
      }
      dispatch(closeDialog());
    }
  };

  const handleImage = (e: any) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-md-6 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h2 className="text-theme m0">
                    {dialogueData == null
                      ? "User Notification"
                      : "Notification"}
                  </h2>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => {
                      dispatch(closeDialog());
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </div>
                </div>
              </div>
              <div className="row align-items-start formBody">
                <div className="col-6">
                  <ExInput
                    type={`text`}
                    id={`title`}
                    name={`title`}
                    value={title}
                    label={`Title`}
                    placeholder={`Title`}
                    errorMessage={error && error.title}
                    onChange={(e: any) => {
                      setTitle(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          title: "Title is required",
                        });
                      } else {
                        return setError({
                          ...error,

                          title: "",
                        });
                      }
                    }}
                  />
                </div>

                <div className="col-6">
                  <ExInput
                    type={`text`}
                    id={`message`}
                    name={`message`}
                    value={message}
                    label={`Message`}
                    placeholder={`Message`}
                    errorMessage={error && error.message}
                    onChange={(e: any) => {
                      setMessage(e.target.value);
                      if (!e.target.value) {
                        return setError({
                          ...error,
                          message: "Message is required",
                        });
                      } else {
                        return setError({
                          ...error,
                          message: "",
                        });
                      }
                    }}
                  />
                </div>

                <div className="col-6">
                  <ExInput
                    label={`Image`}
                    id={`image`}
                    type={`file`}
                    onChange={(e) => handleImage(e)}
                    errorMessage={error?.image && error?.image}
                    accept={"image/*"}
                  />
                  <img
                    src={imagePath !== "" ? imagePath : ""}
                    alt=""
                    draggable="false"
                    className={`${(!imagePath || imagePath === "") && "d-none"
                      } `}
                    data-class={`showImage`}
                    style={{ width: "100px", height: "100px" }}
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
                  {dialogueData && (
                    <Button
                      type={`submit`}
                      className={`text-white m10-left`}
                      style={{ backgroundColor: "#1ebc1e" }}
                      text={`Submit`}
                      onClick={(e) => handleSubmit(e)}
                    />
                  )}
                  {dialogueData == null && (
                    <Button
                      type={`submit`}
                      className={`text-white m10-left`}
                      style={{ backgroundColor: "#1ebc1e" }}
                      text={`Submit`}
                      onClick={(e) => handleAllUser(e)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;
