import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import JournalPage from "../deployment/missions/structures/Stardust/Journal";

export function BasicPopupModal() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="lg"
                        className="rounded-full p-4 bg-[#1a1b26] text-[#a9b1d6] hover:bg-[#24283b] shadow-lg"
                    >
                        <h2 className="text-l text-red-500">Mission Log</h2>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-full max-h-[90vh] w-full sm:w-[90vw] h-full sm:h-[90vh] p-4 rounded-3xl">
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full"
                        >
                            <DialogTitle className="text-3xl text-[#c0caf5]">Welcome to the Modal</DialogTitle>
                            <JournalPage />
                            <Button
                                size="lg"
                                className="mt-6 bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#89b4fa]"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    );
};