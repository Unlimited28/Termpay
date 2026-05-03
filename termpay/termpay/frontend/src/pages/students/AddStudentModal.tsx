import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services/studentService';
import { Class } from '../../services/classService';
import { toast } from 'react-hot-toast';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  onSuccess: () => void;
}

export function AddStudentModal({ isOpen, onClose, classes, onSuccess }: AddStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    class_id: '',
    parent_name: '',
    parent_phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const classOptions = classes.map(c => ({ label: c.name, value: c.id }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.class_id) newErrors.class_id = 'Class is required';
    if (!formData.parent_phone) newErrors.parent_phone = 'Parent phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await studentService.create(formData);
      toast.success('Student added successfully');
      onSuccess();
      onClose();
      setFormData({
        full_name: '',
        class_id: '',
        parent_name: '',
        parent_phone: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Student">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Adewale Ogundimu"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          error={errors.full_name}
        />
        <Select
          label="Class"
          placeholder="Select a class"
          options={classOptions}
          value={formData.class_id}
          onChange={(value) => setFormData({ ...formData, class_id: value })}
          error={errors.class_id}
        />
        <Input
          label="Parent Name"
          placeholder="e.g. Mrs Ogundimu"
          value={formData.parent_name}
          onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
        />
        <Input
          label="Parent Phone"
          placeholder="e.g. 08012345678"
          value={formData.parent_phone}
          onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
          error={errors.parent_phone}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Add Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}
