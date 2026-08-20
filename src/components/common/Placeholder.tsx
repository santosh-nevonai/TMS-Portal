import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/primitives';
import { EmptyState } from '@/components/ui/states';
import { Construction } from 'lucide-react';

export function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <EmptyState
          icon={<Construction size={22} />}
          title={`${title} module`}
          description="This module shares the same design system, navigation and data model as the completed screens. The interactive build is in progress."
        />
      </Card>
    </div>
  );
}
