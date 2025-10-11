import type { NextApiRequest, NextApiResponse } from 'next';

const message = 'This Next.js API route (service-categories/as_consumer.ts) is deprecated. Please call the Rust backend exposed via NEXT_PUBLIC_API_URL instead.';

export default function deprecatedHandler(
  _req: NextApiRequest,
  res: NextApiResponse
): void {
  res.status(410).json({
    error: 'DeprecatedRoute',
    message,
  });
}
