import { buildSeoMetadata } from '@/lib/seo'
import { PrivacyPolicyPage } from '@/components/legal/PrivacyPolicyPage'

export const metadata = buildSeoMetadata(
  undefined,
  {
    title: 'Privacy Policy | Prime Design & Build',
    description:
      "Read Prime Kitchens' Privacy Policy to understand how we collect, use, and protect your personal information when you visit our website or use our services.",
  },
  { path: '/privacy-policy' },
)

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />
}
