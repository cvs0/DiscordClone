'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { MemberRole } from '@prisma/client';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import axios from 'axios';
import {
  Check,
  Gavel,
  Loader2,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldPlus,
  ShieldQuestion,
} from 'lucide-react';
import qs from 'query-string';

import { ServerWithMembersWithProfiles } from '@/types';

import { useModal } from '@/hooks/use-modal-store';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { UserAvatar } from '@/components/user-avatar';

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  GUEST: <Shield className="h-4 w-4 text-zinc-600" />,
  MODERATOR: <ShieldCheck className="h-4 w-4 text-indigo-500" />,
  ADMIN: <ShieldPlus className="h-4 w-4 text-yellow-700" />,
};

export const MembersModal = () => {
  const router = useRouter();

  const { isOpen, onOpen, onClose, type, data } = useModal();

  const [loadingId, setLoadingId] = useState('');

  // TODO: Attempt to improve this implmentation
  const { server } = data as { server: ServerWithMembersWithProfiles };

  const isModalOpen = isOpen && type === 'members';

  const onRoleChange = async ({
    memberId,
    role,
  }: {
    memberId: string;
    role: MemberRole;
  }) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server.id },
      });

      const res = await axios.patch(url, { role });

      router.refresh();
      onOpen('members', { server: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId('');
    }
  };

  const onKick = async ({ memberId }: { memberId: string }) => {
    try {
      setLoadingId(memberId);

      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: { serverId: server.id },
      });

      const res = await axios.delete(url);

      router.refresh();
      onOpen('members', { server: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingId('');
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-8 max-h-[420px] pr-6">
          {server?.members?.map((member) => {
            const isAdmin = member.role === 'ADMIN';
            const isModerator = member.role === 'MODERATOR';
            const isGuest = member.role === 'GUEST';

            return (
              <div key={member.id} className="flex items-center gap-x-2 mb-6">
                <UserAvatar src={member.profile.imageUrl} />
                <div className="flex flex-col gap-y-1">
                  <div className="text-xs font-semibold flex items-center gap-x-1">
                    {member.profile.name}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {roleIconMap[member.role]}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {isAdmin
                            ? 'Admin'
                            : isModerator
                            ? 'Moderator'
                            : 'Guest'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {member.profile.email}
                  </p>
                </div>
                {server.profileId !== member.profileId &&
                  loadingId !== member.id && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <ShieldQuestion className="w-4 h-4 mr-2" />
                              <span>Role</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange({
                                      memberId: member.id,
                                      role: 'GUEST',
                                    })
                                  }
                                  className="gap-x-2"
                                >
                                  <Shield className="h-4 w-4" />
                                  Guest
                                  {isGuest && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange({
                                      memberId: member.id,
                                      role: 'MODERATOR',
                                    })
                                  }
                                  className="gap-x-2"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  Moderator
                                  {isModerator && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onKick({ memberId: member.id })}
                          >
                            <Gavel className="h-4 w-4 mr-2" />
                            Kick
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                {loadingId === member.id && (
                  <Loader2 className="animate-spin text-zinc-500 ml-auto w-4 h-4" />
                )}
              </div>
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};