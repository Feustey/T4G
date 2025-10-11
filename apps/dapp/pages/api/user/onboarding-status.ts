import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
// import { dbConnect, identitiesDAO } from '@t4g/service/data';
import { dbConnect, identitiesDAO } from '../../../lib/stubs/data-stubs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    await dbConnect();
    const user = await identitiesDAO.getUserByEmail(session.user.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      is_onboarded: user.isOnboarded || false,
      role: user.role,
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
