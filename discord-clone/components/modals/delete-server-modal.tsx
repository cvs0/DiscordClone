"use client"

import { useModal } from '@/hooks/use-modal-store'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useState } from 'react';
import { Button } from '../ui/button';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export const DeleteServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter()
    const { server } = data;
    const [isLoading, setIsLoading] = useState(false);

    const isModalOpen = isOpen && type === 'deleteServer';

    const onClick = async () => {
        try {
            setIsLoading(true);

            await axios.delete(`/api/servers/${server?.id}`)

            router.refresh()
            router.push('/')
            onClose();
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
          <DialogContent className="bg-white text-black p-0 overflow-hidden">
            <DialogHeader className="pt-8 px-6">
              <DialogTitle className="text-2xl text-center font-bold">
                Delete Server
              </DialogTitle>
              <DialogDescription className="text-center text-zinc-500">
                Are you sure you want to do this? <br />
                <span className='font-semibold text-indigo-500'>{server?.name}</span> will be permenantly deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <Button variant="ghost" disabled={isLoading} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={isLoading}
                  onClick={onClick}
                >
                  Confirm
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
}