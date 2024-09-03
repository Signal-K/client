import { Dialog, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Cosmos() {
  return (
    <Dialog defaultOpen>
      <DialogContent className="sm:max-w-[500px]">
        <div className="flex items-start gap-4 border-b pb-4">
            <img
                src="/assets/Captn.jpg"
                alt="Cosmos Avatar"
                className="w-12 h-12 rounded-full bg-muted"
            />
          <div>
            <h3 className="text-2xl font-bold">Cosmos, your AI assistant</h3>
            <div className="mt-2 rounded border border-muted p-2 text-sm text-muted-foreground">
              <p>
                Welcome to our game! I'm Cosmos, your friendly AI companion. I'll be guiding you through the onboarding
                process to help you get started.
              </p>
              <p className="mt-2">
                First, let's go over the basic controls. You can move your character using the arrow keys or WASD. To
                interact with objects, simply walk up to them and press the spacebar.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};