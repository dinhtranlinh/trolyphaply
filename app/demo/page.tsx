'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import SearchBar from '@/components/ui/SearchBar';
import Accordion from '@/components/ui/Accordion';
import EmptyState from '@/components/ui/EmptyState';
import Toast, { ToastProps } from '@/components/ui/Toast';
import BottomSheet from '@/components/ui/BottomSheet';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Select from '@/components/forms/Select';
import RadioGroup from '@/components/forms/RadioGroup';
import CheckboxGroup from '@/components/forms/CheckboxGroup';
import PromptCard from '@/components/content/PromptCard';
import MiniAppCard from '@/components/content/MiniAppCard';
import LegalDocCard from '@/components/content/LegalDocCard';
import ProcedureCard from '@/components/content/ProcedureCard';
import TagList from '@/components/content/TagList';

/**
 * Component Demo Page
 * Test tất cả components đã tạo trong SESSION 2
 */
export default function ComponentDemoPage() {
  const [searchValue, setSearchValue] = useState('');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    textarea: '',
    select: '',
    radio: '',
    checkboxes: [] as string[],
  });

  return (
    <AppShell
      showHeader={true}
      headerTitle="Component Demo"
      showBackButton={false}
    >
      <div className="p-4 space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
            🎨 Component Library
          </h1>
          <p className="text-muted">SESSION 2 - Design System Demo</p>
        </div>

        {/* Colors */}
        <Card>
          <h2 className="section-title mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--color-primary)' }} />
              <p className="text-xs">Primary</p>
            </div>
            <div>
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--color-accent)' }} />
              <p className="text-xs">Accent</p>
            </div>
            <div>
              <div className="w-full h-16 rounded-lg mb-2 border" style={{ background: 'var(--color-bg)' }} />
              <p className="text-xs">Background</p>
            </div>
            <div>
              <div className="w-full h-16 rounded-lg mb-2" style={{ background: 'var(--color-success)' }} />
              <p className="text-xs">Success</p>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <Card>
          <h2 className="section-title mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setToast({ message: 'Primary clicked!', type: 'info' })}>
              Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
          </div>
        </Card>

        {/* Chips */}
        <Card>
          <h2 className="section-title mb-4">Chips</h2>
          <div className="flex flex-wrap gap-2">
            <Chip>Default</Chip>
            <Chip active>Active</Chip>
            <Chip onRemove={() => alert('Removed!')}>Removable</Chip>
            <Chip variant="primary">Primary</Chip>
            <Chip variant="accent" active>Accent Active</Chip>
          </div>
        </Card>

        {/* Search Bar */}
        <Card>
          <h2 className="section-title mb-4">Search Bar</h2>
          <SearchBar
            placeholder="Tìm kiếm..."
            value={searchValue}
            onChange={setSearchValue}
            onSearch={(val) => alert(`Searching for: ${val}`)}
          />
        </Card>

        {/* Form Inputs */}
        <Card>
          <h2 className="section-title mb-4">Form Components</h2>
          <div className="space-y-4">
            <TextInput
              label="Text Input"
              value={formData.text}
              onChange={(val) => setFormData({ ...formData, text: val })}
              placeholder="Enter text..."
              helperText="This is a helper text"
            />
            
            <TextArea
              label="Text Area"
              value={formData.textarea}
              onChange={(val) => setFormData({ ...formData, textarea: val })}
              placeholder="Enter long text..."
              maxLength={200}
            />
            
            <Select
              label="Select"
              value={formData.select}
              onChange={(val) => setFormData({ ...formData, select: val })}
              options={[
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
                { value: 'option3', label: 'Option 3' },
              ]}
              placeholder="Choose option..."
            />
            
            <RadioGroup
              label="Radio Group"
              value={formData.radio}
              onChange={(val) => setFormData({ ...formData, radio: val })}
              name="demo-radio"
              options={[
                { value: 'radio1', label: 'Radio 1', description: 'First option' },
                { value: 'radio2', label: 'Radio 2', description: 'Second option' },
              ]}
            />
            
            <CheckboxGroup
              label="Checkbox Group"
              values={formData.checkboxes}
              onChange={(val) => setFormData({ ...formData, checkboxes: val })}
              options={[
                { value: 'check1', label: 'Checkbox 1' },
                { value: 'check2', label: 'Checkbox 2' },
                { value: 'check3', label: 'Checkbox 3' },
              ]}
            />
          </div>
        </Card>

        {/* Accordion */}
        <Card>
          <h2 className="section-title mb-4">Accordion</h2>
          <Accordion
            items={[
              {
                id: '1',
                title: 'Chương 1: Giới thiệu',
                content: <p>Nội dung chương 1 về giới thiệu pháp luật...</p>,
              },
              {
                id: '2',
                title: 'Chương 2: Quyền và nghĩa vụ',
                content: <p>Nội dung chương 2 về quyền và nghĩa vụ...</p>,
              },
              {
                id: '3',
                title: 'Chương 3: Thủ tục',
                content: <p>Nội dung chương 3 về các thủ tục...</p>,
              },
            ]}
          />
        </Card>

        {/* Toast Demo */}
        <Card>
          <h2 className="section-title mb-4">Toasts</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setToast({ message: 'Success message!', type: 'success' })}
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setToast({ message: 'Error occurred!', type: 'error' })}
            >
              Error Toast
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setToast({ message: 'Warning message!', type: 'warning' })}
            >
              Warning Toast
            </Button>
          </div>
        </Card>

        {/* Bottom Sheet Demo */}
        <Card>
          <h2 className="section-title mb-4">Bottom Sheet</h2>
          <Button onClick={() => setBottomSheetOpen(true)}>Open Bottom Sheet</Button>
        </Card>

        {/* Empty State */}
        <Card>
          <EmptyState
            title="Không có dữ liệu"
            description="Chưa có nội dung nào được tạo. Hãy thêm mới!"
            action={{
              label: 'Thêm mới',
              onClick: () => alert('Add new!'),
            }}
          />
        </Card>

        {/* Content Components */}
        <div className="space-y-4">
          <h2 className="section-title">Content Cards</h2>
          
          <PromptCard
            title="Phân tích hợp đồng mua bán"
            category="Pháp luật"
            tags={['hợp đồng', 'dân sự', 'phân tích']}
            isPublic={true}
            onClick={() => alert('Prompt clicked!')}
            onCopy={() => setToast({ message: 'Đã copy prompt!', type: 'success' })}
          />
          
          <MiniAppCard
            slug="van-menh"
            title="Vận Mệnh Hôm Nay"
            description="Xem vận mệnh theo phong cách Gen Z với AI"
            category="Xem bói"
            tags={['xem bói', 'vui', 'Gen Z']}
            icon="🔮"
            isPublished={true}
            onClick={() => alert('App clicked!')}
          />
          
          <LegalDocCard
            title="Bộ luật Dân sự 2015"
            code="91/2015/QH13"
            category="Dân sự"
            documentType="Luật"
            tags={['Dân sự', 'Quyền sở hữu', 'Hợp đồng']}
            issuedDate="2015-11-24"
            effectiveDate="2017-01-01"
            onClick={() => alert('Document clicked!')}
          />
          
          <ProcedureCard
            title="Đăng ký kết hôn"
            category="Hôn nhân và gia đình"
            difficulty="easy"
            estimatedTime="7-10 ngày"
            authority="UBND cấp xã"
            tags={['hôn nhân', 'đăng ký', 'thủ tục dân sự']}
            onClick={() => alert('Procedure clicked!')}
          />
        </div>

        {/* Tag List */}
        <Card>
          <h2 className="section-title mb-4">Tag List</h2>
          <TagList
            tags={['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5', 'Tag 6', 'Tag 7']}
            maxDisplay={5}
            onTagClick={(tag) => alert(`Clicked: ${tag}`)}
          />
        </Card>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Filters"
      >
        <div className="space-y-4">
          <p>This is a bottom sheet content</p>
          <Button fullWidth onClick={() => setBottomSheetOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
