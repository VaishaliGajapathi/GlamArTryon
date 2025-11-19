import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface AuthGateProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export default function AuthGate({ isOpen, onClose, onSignIn }: AuthGateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-auth-gate" className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">Sign in to use Virtual Try-On</DialogTitle>
          <DialogDescription className="text-center">
            Create an account or sign in to upload your photo and try on items virtually
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onSignIn} data-testid="button-signin" className="w-full">
            Sign In
          </Button>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
