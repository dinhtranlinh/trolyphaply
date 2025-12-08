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
  Plus, 
  Star,
  AlertTriangle
} from 'lucide-react'

interface Example {
  id: string
  before: string
  after: string
  style_guide_id: string
  created_at: string
}

interface StyleGuide {
  id: string
  name: string
  description: string
  characteristics: string[]
  tone: string[]
  language: string
  is_default: boolean
  examples: Example[]
  created_at: string
  updated_at: string
}

export default function StyleGuideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [guide, setGuide] = useState<StyleGuide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Example dialog states
  const [showExampleDialog, setShowExampleDialog] = useState(false)
  const [editingExample, setEditingExample] = useState<Example | null>(null)
  const [exampleBefore, setExampleBefore] = useState('')
  const [exampleAfter, setExampleAfter] = useState('')
  const [exampleSaving, setExampleSaving] = useState(false)

  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<'guide' | 'example' | null>(null)
  const [deleteExampleId, setDeleteExampleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Set default action
  const [settingDefault, setSettingDefault] = useState(false)

  useEffect(() => {
    fetchGuide()
  }, [id])

  const fetchGuide = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/style-guides/${id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch style guide')
      }

      setGuide(data.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async () => {
    if (!guide) return
    
    try {
      setSettingDefault(true)
      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to set default')
      }

      await fetchGuide()
      alert('Đã đặt làm văn phong mặc định')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSettingDefault(false)
    }
  }

  const handleDeleteGuide = async () => {
    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      router.push('/admin/style-guides')
    } catch (err: any) {
      alert(err.message)
      setDeleting(false)
    }
  }

  const openExampleDialog = (example?: Example) => {
    if (example) {
      setEditingExample(example)
      setExampleBefore(example.before)
      setExampleAfter(example.after)
    } else {
      setEditingExample(null)
      setExampleBefore('')
      setExampleAfter('')
    }
    setShowExampleDialog(true)
  }

  const closeExampleDialog = () => {
    setShowExampleDialog(false)
    setEditingExample(null)
    setExampleBefore('')
    setExampleAfter('')
  }

  const handleSaveExample = async () => {
    if (!exampleBefore.trim() || !exampleAfter.trim()) {
      alert('Vui lòng nhập đầy đủ trước và sau')
      return
    }

    try {
      setExampleSaving(true)
      
      if (editingExample) {
        // Update existing example
        const res = await fetch(`/api/admin/style-guides/${id}/examples/${editingExample.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            before: exampleBefore,
            after: exampleAfter
          })
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update example')
        }
      } else {
        // Create new example
        const res = await fetch(`/api/admin/style-guides/${id}/examples`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            before: exampleBefore,
            after: exampleAfter
          })
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create example')
        }
      }

      await fetchGuide()
      closeExampleDialog()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setExampleSaving(false)
    }
  }

  const handleDeleteExample = async () => {
    if (!deleteExampleId) return

    try {
      setDeleting(true)
      const res = await fetch(`/api/admin/style-guides/${id}/examples/${deleteExampleId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete example')
      }

      await fetchGuide()
      setShowDeleteDialog(false)
      setDeleteExampleId(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (type: 'guide' | 'example', exampleId?: string) => {
    setDeleteTarget(type)
    if (type === 'example' && exampleId) {
      setDeleteExampleId(exampleId)
    }
    setShowDeleteDialog(true)
  }

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

  if (error || !guide) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy văn phong'}</p>
            <Button onClick={() => router.push('/admin/style-guides')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/style-guides')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{guide.name}</h1>
              {guide.is_default && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Mặc định
                </Badge>
              )}
              <Badge variant="outline">{guide.language}</Badge>
            </div>
            <p className="text-gray-600">{guide.description}</p>
          </div>

          <div className="flex gap-2">
            {!guide.is_default && (
              <Button
                onClick={handleSetDefault}
                disabled={settingDefault}
                variant="outline"
              >
                <Star className="mr-2 h-4 w-4" />
                Đặt làm mặc định
              </Button>
            )}
            <Button
              onClick={() => router.push(`/admin/style-guides/${id}/edit`)}
              variant="default"
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              onClick={() => confirmDelete('guide')}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Characteristics & Tone */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Đặc điểm</CardTitle>
              <CardDescription>Các đặc điểm của văn phong</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guide.characteristics.map((char, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-[#E5A100] mt-0.5">•</span>
                    <span>{char}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giọng điệu</CardTitle>
              <CardDescription>Các từ khóa về giọng văn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {guide.tone.map((t, index) => (
                  <Badge key={index} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Examples */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ví dụ minh họa</CardTitle>
                  <CardDescription>
                    {guide.examples.length} ví dụ
                  </CardDescription>
                </div>
                <Button onClick={() => openExampleDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm ví dụ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {guide.examples.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">Chưa có ví dụ nào</p>
                  <Button onClick={() => openExampleDialog()} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm ví dụ đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {guide.examples.map((example) => (
                    <div
                      key={example.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#0B3B70] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          Ví dụ #{example.id.slice(0, 8)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openExampleDialog(example)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmDelete('example', example.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                            Trước
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed bg-red-50 p-3 rounded">
                            {example.before}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                            Sau
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed bg-green-50 p-3 rounded">
                            {example.after}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Example Dialog */}
      <Dialog open={showExampleDialog} onOpenChange={setShowExampleDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingExample ? 'Chỉnh sửa ví dụ' : 'Thêm ví dụ mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập văn bản trước và sau khi áp dụng văn phong
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Văn bản trước khi chỉnh sửa
              </label>
              <TextArea
                value={exampleBefore}
                onChange={(e) => setExampleBefore(e.target.value)}
                placeholder="Nhập văn bản gốc..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Văn bản sau khi chỉnh sửa
              </label>
              <TextArea
                value={exampleAfter}
                onChange={(e) => setExampleAfter(e.target.value)}
                placeholder="Nhập văn bản đã được chỉnh sửa..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeExampleDialog}>
              Hủy
            </Button>
            <Button onClick={handleSaveExample} disabled={exampleSaving}>
              {exampleSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Xác nhận xóa
            </DialogTitle>
            <DialogDescription>
              {deleteTarget === 'guide' ? (
                <>
                  Bạn có chắc chắn muốn xóa văn phong <strong>{guide.name}</strong>?
                  <br />
                  Hành động này không thể hoàn tác.
                </>
              ) : (
                'Bạn có chắc chắn muốn xóa ví dụ này? Hành động này không thể hoàn tác.'
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteTarget(null)
                setDeleteExampleId(null)
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={deleteTarget === 'guide' ? handleDeleteGuide : handleDeleteExample}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
