// Example usage page for Template Editor V2
// Place this in app/templates/[id]/edit/page.tsx

'use client';

import { use } from 'react';
import TemplateEditorV2 from '@/components/template-editor-v2/TemplateEditorV2';
import { useRouter } from 'next/navigation';

export default function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <TemplateEditorV2
      templateId={id}
      onBack={() => router.back()}
    />
  );
}
