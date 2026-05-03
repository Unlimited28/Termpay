import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { Search, Mail, Plus } from 'lucide-react';

export default function UIPreview() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState('');

  const selectOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
    { label: 'Option 4', value: '4' },
    { label: 'Option 5', value: '5' },
  ];

  return (
    <div className="min-h-screen bg-surface-bg p-8">
      <PageHeader
        title="UI Component Preview"
        description="A showcase of all design system components."
        actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />}>Action</Button>}
      />

      <div className="mt-12 space-y-12 max-w-6xl mx-auto">
        {/* Buttons */}
        <section>
          <h2 className="text-xl font-bold mb-6">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button loading>Loading State</Button>
            <Button disabled>Disabled Button</Button>
          </div>
        </section>

        {/* Inputs */}
        <section>
          <h2 className="text-xl font-bold mb-6">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Normal Input" placeholder="Type something..." />
            <Input label="Input with Icons" placeholder="Search..." leftIcon={<Search className="w-4 h-4" />} rightIcon={<Mail className="w-4 h-4" />} />
            <Input label="Error State" error="This field is required" defaultValue="Invalid input" />
          </div>
        </section>

        {/* Select */}
        <section>
          <h2 className="text-xl font-bold mb-6">Select</h2>
          <div className="w-64">
            <Select
              label="Choose an option"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              placeholder="Select an option"
            />
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-xl font-bold mb-6">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="paid">Paid</Badge>
            <Badge variant="partial">Partial</Badge>
            <Badge variant="unpaid">Unpaid</Badge>
            <Badge variant="high">High</Badge>
            <Badge variant="medium">Medium</Badge>
            <Badge variant="review">Review</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-xl font-bold mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">Default Card Content</Card>
            <Card className="p-6" accentColor="brand-blue">Card with Blue Accent</Card>
            <Card className="p-6" accentColor="brand-amber">Card with Amber Accent</Card>
          </div>
        </section>

        {/* Toasts */}
        <section>
          <h2 className="text-xl font-bold mb-6">Toasts</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => toast.success('Success message!')} className="btn-primary px-4 py-2 bg-brand-green text-white rounded">Success Toast</button>
            <button onClick={() => toast.error('Error message!')} className="btn-primary px-4 py-2 bg-brand-red text-white rounded">Error Toast</button>
            <button onClick={() => toast.warning('Warning message!')} className="btn-primary px-4 py-2 bg-brand-amber text-white rounded">Warning Toast</button>
            <button onClick={() => toast.info('Info message!')} className="btn-primary px-4 py-2 bg-brand-blue text-white rounded">Info Toast</button>
          </div>
        </section>

        {/* Modal */}
        <section>
          <h2 className="text-xl font-bold mb-6">Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Preview Modal"
          >
            <div className="p-6">
              <p className="text-text-secondary">This is a preview of the modal component. It has a backdrop blur and smooth scale animation.</p>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setIsModalOpen(false)}>Close</Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Skeletons */}
        <section>
          <h2 className="text-xl font-bold mb-6">Skeletons</h2>
          <div className="space-y-6">
            <div className="w-1/2"><LoadingSkeleton variant="text" /></div>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="stats" />
            <LoadingSkeleton variant="table" />
          </div>
        </section>

        {/* Empty State */}
        <section>
          <h2 className="text-xl font-bold mb-6">Empty State</h2>
          <EmptyState
            title="No records found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={<Button variant="secondary">Clear Filters</Button>}
          />
        </section>
      </div>
    </div>
  );
}
