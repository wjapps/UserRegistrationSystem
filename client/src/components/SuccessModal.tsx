import { SuccessModalProps } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";

export default function SuccessModal({
  message,
  isOpen,
  onClose,
}: SuccessModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Success!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center">
          <AlertDialogAction className="bg-primary hover:bg-indigo-700" onClick={onClose}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
