import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './dialog';
import { Button } from './button';

const DeleteDialog = ({
  children,
  title = "Delete Item",
  onDelete,
}) => {
  const handleDelete = (e) => {
    e.preventDefault();
    onDelete();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button size="icon" variant="destructiveGhost">
            <Trash2 />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-80 md:w-96 p-0 rounded-2xl md:rounded-2xl">
        <DialogHeader className="px-6 pt-8">
          <DialogTitle className="text-start">Delete {title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-6">
          Are you sure you want to delete this {title.toLowerCase()}?
        </DialogDescription>
        <DialogFooter className="flex-col-reverse p-4 pt-2 gap-3 md:gap-0">
          <DialogClose asChild>
            <Button size="sm" variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;