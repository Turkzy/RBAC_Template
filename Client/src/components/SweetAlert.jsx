import Swal from "sweetalert2";

// Toast notification (top-right corner)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

// Reusable SweetAlert functions
const SweetAlert = {
  // Success alert
  success: (title = "Success!", text = "") => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      iconColor: "#10b981",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  },

  // Error alert
  error: (title = "Error!", text = "Something went wrong") => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      iconColor: "#ef4444",
      confirmButtonColor: "#000000",
    });
  },

  // Warning alert
  warning: (title = "Warning!", text = "") => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      iconColor: "#f59e0b",
      confirmButtonColor: "#3085d6",
    });
  },

  // Info alert
  info: (title = "Info", text = "") => {
    return Swal.fire({
      title,
      text,
      icon: "info",
      iconColor: "#3b82f6",
      confirmButtonColor: "#3085d6",
    });
  },

  // Confirmation dialog (Delete)
  confirmDelete: (itemName = "this item") => {
    return Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: `Do you want to delete "${itemName}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      iconColor: "#f59e0b",
    });
  },

  // Confirmation dialog (Generic)
  confirm: (title = "Are you sure?", text = "", confirmText = "Yes", cancelText = "Cancel") => {
    return Swal.fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      iconColor: "#3b82f6",
    });
  },

  // Toast notifications
  toast: {
    success: (title = "Success!") => {
      return Toast.fire({
        icon: "success",
        title,
        iconColor: "#10b981",
      });
    },
    error: (title = "Error!") => {
      return Toast.fire({
        icon: "error",
        title,
        iconColor: "#ef4444",
      });
    },
    warning: (title = "Warning!") => {
      return Toast.fire({
        icon: "warning",
        title,
        iconColor: "#f59e0b",
      });
    },
    info: (title = "Info") => {
      return Toast.fire({
        icon: "info",
        title,
        iconColor: "#3b82f6",
      });
    },
  },

  // Loading indicator
  loading: (title = "Loading...", text = "Please wait") => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Close any open alert
  close: () => {
    Swal.close();
  },
};

export default SweetAlert;
