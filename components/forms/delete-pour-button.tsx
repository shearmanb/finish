"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { deletePour } from "@/lib/actions/pours";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function DeletePourButton({ pourId }: { pourId: string }) {
  const [pending, start] = React.useTransition();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-destructive">
          <Trash2 className="size-4" /> Delete pour
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this pour?</DialogTitle>
          <DialogDescription>
            This permanently removes the tasting notes and scores for this pour.
            The pour numbering of others is unaffected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => start(() => deletePour(pourId).then(() => {}))}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
