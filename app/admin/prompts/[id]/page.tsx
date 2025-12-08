'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TextInput } from '@/components/ui/text-input'
import { TextArea } from '@/components/ui/text-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Save,
  History,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'

interface Prompt {
  id: string
  title: string
  body: string
  category: string
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

interface Version {
  id: string
  prompt_id: string
  version: number
  title: string
  body: string
  category: string
  tags: string[]
  is_public: boolean
  created_by: string | null
  created_at: string
}

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedBody, setEditedBody] = useState('')
  const [editedCategory, setEditedCategory] = useState('')
  const [editedTags, setEditedTags] = useState('')
  const [editedIsPublic, setEditedIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)

  // Version note dialog
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const [versionNote, setVersionNote] = useState('')

  // Restore confirmation
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [restoreVersion, setRestoreVersion] = useState<Version | null>(null)
  const [restoring, setRestoring] = useState(false)

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch prompt
      const promptRes = await fetch(`/api/admin/prompts/${id}`)
      const promptData = await promptRes.json()

      if (!promptRes.ok) {
        throw new Error(promptData.error || 'Failed to fetch prompt')
      }

      setPrompt(promptData.data)
      setEditedTitle(promptData.data.title)
      setEditedBody(promptData.data.body)
      setEditedCategory(promptData.data.category)
      setEditedTags(promptData.data.tags.join(', '))
      setEditedIsPublic(promptData.data.is_public)

      // Fetch versions
      const versionsRes = await fetch(`/api/admin/prompts/${id}/versions`)
      const versionsData = await versionsRes.json()

      if (versionsRes.ok) {
        setVersions(versionsData.data || [])
      }

      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWithVersion = () => {
    setShowVersionDialog(true)
  }

  const handleSave = async (saveVersion: boolean) => {
    try {
      setSaving(true)

      const tagsArray = editedTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const res = await fetch(`/api/admin/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTitle,
          body: editedBody,
          category: editedCategory,
          tags: tagsArray,
          is_public: editedIsPublic,
          save_version: saveVersion,
          version_note: versionNote || undefined
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      await fetchData()
      setIsEditing(false)
      setShowVersionDialog(false)
      setVersionNote('')
      alert('Cập nhật thành công')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmRestore = (version: Version) => {
    setRestoreVersion(version)
    setShowRestoreDialog(true)
  }

  const handleRestore = async () => {
    if (!restoreVersion) return

    try {
      setRestoring(true)

      const res = await fetch(`/api/admin/prompts/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore',
          version_id: restoreVersion.id,
          note: `Restored from version ${restoreVersion.version}`
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore')
      }

      await fetchData()
      setShowRestoreDialog(false)
      setRestoreVersion(null)
      setActiveTab('current')
      alert(`Đã khôi phục về version ${restoreVersion.version}`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setRestoring(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)

      const res = await fetch(`/api/admin/prompts/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      router.push('/admin/prompts')
    } catch (err: any) {
      alert(err.message)
      setDeleting(false)
    }
  }

  const categories = [
    { value: 'writing', label: 'Viết lách' },
    { value: 'analysis', label: 'Phân tích' },
    { value: 'coding', label: 'Lập trình' },
    { value: 'creative', label: 'Sáng tạo' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'business', label: 'Kinh doanh' },
    { value: 'other', label: 'Khác' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B3B70] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy prompt'}</p>
            <Button onClick={() => router.push('/admin/prompts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/prompts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{prompt.title}</h1>
              {prompt.is_public && (
                <Badge variant="secondary">Công khai</Badge>
              )}
              <Badge variant="outline">{categories.find(c => c.value === prompt.category)?.label}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {prompt.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)} variant="default">
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button onClick={() => setShowDeleteDialog(true)} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Hủy
                </Button>
                <Button onClick={handleSaveWithVersion} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu & tạo version
                </Button>
                <Button onClick={() => handleSave(false)} disabled={saving} variant="secondary">
                  Lưu không version
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'current'
                ? 'border-[#0B3B70] text-[#0B3B70]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit className="inline-block mr-2 h-4 w-4" />
            Nội dung hiện tại
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-[#0B3B70] text-[#0B3B70]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="inline-block mr-2 h-4 w-4" />
            Lịch sử versions ({versions.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'current' ? (
        <Card>
          <CardContent className="pt-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                  <TextInput
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Nhập tiêu đề prompt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung *</label>
                  <TextArea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    placeholder="Nhập nội dung prompt"
                    rows={12}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Danh mục</label>
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <TextInput
                      value={editedTags}
                      onChange={(e) => setEditedTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={editedIsPublic}
                    onChange={(e) => setEditedIsPublic(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Công khai prompt này
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">NỘI DUNG</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {prompt.body}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Tạo lúc</p>
                    <p className="text-sm font-medium">{new Date(prompt.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cập nhật</p>
                    <p className="text-sm font-medium">{new Date(prompt.updated_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử phiên bản</CardTitle>
            <CardDescription>
              Các phiên bản trước đây của prompt này
            </CardDescription>
          </CardHeader>
          <CardContent>
            {versions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Chưa có version nào được lưu</p>
                <p className="text-sm mt-2">Sử dụng "Lưu & tạo version" khi chỉnh sửa để tạo version mới</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#0B3B70] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">v{version.version}</Badge>
                        <span className="text-sm font-medium">{version.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmRestore(version)}
                      >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        Khôi phục
                      </Button>
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap line-clamp-3">
                        {version.body}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>Danh mục: {categories.find(c => c.value === version.category)?.label}</span>
                        <span>{version.tags.length} tags</span>
                        <span>{version.is_public ? 'Công khai' : 'Riêng tư'}</span>
                      </div>
                      <div>
                        {version.created_by && <span className="mr-3">Note: {version.created_by}</span>}
                        <span>{new Date(version.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Version Note Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm ghi chú cho version mới</DialogTitle>
            <DialogDescription>
              Tạo version mới trước khi lưu thay đổi (không bắt buộc)
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Ghi chú</label>
            <TextInput
              value={versionNote}
              onChange={(e) => setVersionNote(e.target.value)}
              placeholder="Ví dụ: Cập nhật cấu trúc prompt, thêm ví dụ..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
              Hủy
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Xác nhận khôi phục
            </DialogTitle>
            <DialogDescription>
              {restoreVersion && (
                <>
                  Khôi phục về <strong>version {restoreVersion.version}</strong>?
                  <br />
                  Nội dung hiện tại sẽ được lưu thành version mới trước khi khôi phục.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleRestore} disabled={restoring}>
              {restoring ? 'Đang khôi phục...' : 'Khôi phục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa prompt <strong>{prompt.title}</strong>?
              <br />
              Tất cả versions cũng sẽ bị xóa. Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
