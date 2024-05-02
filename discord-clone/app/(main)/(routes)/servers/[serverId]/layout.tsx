import { PropsWithChildren } from 'react';

import { redirect } from 'next/navigation';

import { redirectToSignIn } from '@clerk/nextjs';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import ServerSidebar from '@/components/server/server-sidebar';

type ServerIdLayoutProps = PropsWithChildren<{
  params: { serverId: string };
}>;

const ServerIdLayout = async ({ params, children }: ServerIdLayoutProps) => {
  const profile = await currentProfile();

  if (profile == null) return redirectToSignIn();

  console.log(params.serverId)

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: { some: { profileId: profile.id } },
    },
  });

  if (server == null) return redirect('/');

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;