import { CheckCircle } from "lucide-react";
import { Button } from "./ui/Button";
import { useNavigate } from "react-router-dom";

interface SuccessModalProps {
  title?: string;
  message?: string;
  onClose?: () => void;
}

const SuccessModal = ({
  title = "Thank You!",
  message = "Your submission has been received successfully.",
  onClose,
}: SuccessModalProps) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 sm:mb-8">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
          {title}
        </h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        <Button onClick={handleClose} size="lg" className="w-full sm:w-auto">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default SuccessModal;
