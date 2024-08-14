import Swal from "sweetalert2";
import { DangerRight } from "../api/toastServices";

export const warning = (confirm : any) => {

  console.log("confirm" , confirm)

  return Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    iconHtml: '<i class="ri-alert-line"></i>',
    showCancelButton: true,
    confirmButtonText: confirm,
    customClass: {
      confirmButton: "btn bg-second text-light m15-right",
      cancelButton: "btn bg-darkGray text-light",
    },
    buttonsStyling: false,
  });
};

export const permissionError = () => {
  return  DangerRight("Opps! you don't have Permission...");
};
