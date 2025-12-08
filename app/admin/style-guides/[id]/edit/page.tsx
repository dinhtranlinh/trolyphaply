'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TextInput } from '@/components/ui/text-input'
import { TextArea } from '@/components/ui/text-area'
import { ArrowLeft, Save } from 'lucide-react'

interface StyleGuide {
  id: string
  name: string
  description: string
  characteristics: string[]
  tone: string[]
  language: string
  is_default: boolean
}

export default function EditStyleGuidePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [characteristics, setCharacteristics] = useState('')
  const [tone, setTone] = useState('')
  const [language, setLanguage] = useState('vi')
  const [isDefault, setIsDefault] = useState(false)

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

      const guide: StyleGuide = data.data
      setName(guide.name)
      setDescription(guide.description)
      setCharacteristics(guide.characteristics.join('\n'))
      setTone(guide.tone.join(', '))
      setLanguage(guide.language)
      setIsDefault(guide.is_default)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !description.trim()) {
      alert('Vui lòng nhập tên và mô tả')
      return
    }

    const characteristicsArray = characteristics
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean)

    const toneArray = tone
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    if (characteristicsArray.length === 0) {
      alert('Vui lòng nhập ít nhất một đặc điểm')
      return
    }

    try {
      setSaving(true)

      const res = await fetch(`/api/admin/style-guides/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          characteristics: characteristicsArray,
          tone: toneArray,
          language,
          is_default: isDefault
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update style guide')
      }

      router.push(`/admin/style-guides/${id}`)
    } catch (err: any) {
      alert(err.message)
      setSaving(false)
    }
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push(`/admin/style-guides/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa văn phong</CardTitle>
          <CardDescription>
            Cập nhật thông tin văn phong
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên văn phong *
              </label>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Văn phong chuyên nghiệp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mô tả *
              </label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về văn phong này"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Đặc điểm *
              </label>
              <TextArea
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
                placeholder="Mỗi đặc điểm trên một dòng&#10;Ví dụ:&#10;Sử dụng ngôn ngữ trang trọng&#10;Tránh từ lóng và biệt ngữ&#10;Câu văn ngắn gọn, rõ ràng"
                rows={6}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Mỗi dòng là một đặc điểm
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Giọng điệu (tone)
              </label>
              <TextInput
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ví dụ: chuyên nghiệp, trang trọng, lịch sự"
              />
              <p className="text-sm text-gray-500 mt-1">
                Các từ khóa phân cách bởi dấu phẩy
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ngôn ngữ
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B3B70]"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-[#0B3B70] border-gray-300 rounded focus:ring-[#0B3B70]"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Đặt làm văn phong mặc định
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/style-guides/${id}`)}
                disabled={saving}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
