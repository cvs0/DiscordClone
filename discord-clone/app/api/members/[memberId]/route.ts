import { NextResponse } from 'next/server';

import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } },
) {
  try {
    const { role } = await req.json();

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');

    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const profileId = profile.id;

    const memberId = params.memberId;

    if (!params.memberId) {
      return new NextResponse('Member ID is missing', { status: 400 });
    }

    if (!serverId) {
      return new NextResponse('Server ID is missing', { status: 400 });
    }

    const server = await db.server.update({
      where: { id: serverId, profileId },
      data: {
        members: {
          update: {
            where: { id: memberId, profileId: { not: profileId } },
            data: { role },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (err) {
    console.log('members_[memberId]_PATCH', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string } },
  ) {
    try {
      const { searchParams } = new URL(req.url);
      const serverId = searchParams.get('serverId');
  
      const profile = await currentProfile();
  
      if (!profile) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
  
      const profileId = profile.id;
  
      const memberId = params.memberId;
  
      if (!params.memberId) {
        return new NextResponse('Member ID is missing', { status: 400 });
      }
  
      if (!serverId) {
        return new NextResponse('Server ID is missing', { status: 400 });
      }
  
      const server = await db.server.update({
        where: { id: serverId, profileId },
        data: {
          members: {
            delete: {
              id: memberId,
              profileId: { not: profileId },
            },
          },
        },
        include: {
          members: {
            include: {
              profile: true,
            },
            orderBy: {
              role: 'asc',
            },
          },
        },
      });
  
      return NextResponse.json(server);
    } catch (err) {
      console.log('members_[memberId]_DELETE', err);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }