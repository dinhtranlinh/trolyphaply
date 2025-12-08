'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportResult {
  success: boolean
  message: string
  results?: {
    documents: { imported: number; skipped: number; errors: string[] }
    procedures: { imported: number; skipped: number; errors: string[] }
  }
  errors?: {
    documents: string[]
    procedures: string[]
  }
}

export default function ImportLegalLibraryPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preview, setPreview] = useState<any>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.json')) {
      alert('Vui lòng chọn file JSON')
      return
    }

    setFile(selectedFile)
    setResult(null)

    // Preview file content
    try {
      const text = await selectedFile.text()
      const json = JSON.parse(text)
      setPreview({
        documents: json.legalLibraryItems?.length || 0,
        procedures: json.procedures?.length || 0
      })
    } catch (err) {
      alert('File JSON không hợp lệ')
      setFile(null)
      setPreview(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    try {
      setImporting(true)
      const text = await file.text()
      const json = JSON.parse(text)

      const res = await fetch('/api/admin/legal-library/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      })

      const data = await res.json()
      setResult(data)

      if (data.success) {
        // Auto redirect after 3 seconds if successful
        setTimeout(() => {
          router.push('/admin/documents')
        }, 3000)
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Import failed'
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/admin/documents')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Import Legal Library</CardTitle>
          <CardDescription>
            Import văn bản pháp luật và thủ tục từ file JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Chọn file JSON
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0B3B70] transition-colors">
                <Upload className="mr-2 h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Chọn file...'}
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <FileJson className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Nội dung file:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {preview.documents > 0 && (
                        <li>📄 {preview.documents} văn bản pháp luật</li>
                      )}
                      {preview.procedures > 0 && (
                        <li>📋 {preview.procedures} thủ tục hành chính</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Button */}
          {file && !result && (
            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full"
              size="lg"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Bắt đầu Import
                </>
              )}
            </Button>
          )}

          {/* Results */}
          {result && (
            <Card className={result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.message}
                    </p>

                    {result.results && (
                      <div className="space-y-2 text-sm">
                        {result.results.documents && (
                          <div>
                            <p className="font-medium">Văn bản:</p>
                            <ul className="list-disc list-inside ml-2">
                              <li>✅ Imported: {result.results.documents.imported}</li>
                              <li>⏭️ Skipped: {result.results.documents.skipped}</li>
                              {result.results.documents.errors.length > 0 && (
                                <li className="text-red-700">❌ Errors: {result.results.documents.errors.length}</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {result.results.procedures && (
                          <div>
                            <p className="font-medium">Thủ tục:</p>
                            <ul className="list-disc list-inside ml-2">
                              <li>✅ Imported: {result.results.procedures.imported}</li>
                              <li>⏭️ Skipped: {result.results.procedures.skipped}</li>
                              {result.results.procedures.errors.length > 0 && (
                                <li className="text-red-700">❌ Errors: {result.results.procedures.errors.length}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Details */}
                    {result.errors && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-red-800">
                          Chi tiết lỗi ({(result.errors.documents?.length || 0) + (result.errors.procedures?.length || 0)})
                        </summary>
                        <div className="mt-2 space-y-2 text-xs">
                          {result.errors.documents?.map((err, idx) => (
                            <div key={idx} className="text-red-700">• {err}</div>
                          ))}
                          {result.errors.procedures?.map((err, idx) => (
                            <div key={idx} className="text-red-700">• {err}</div>
                          ))}
                        </div>
                      </details>
                    )}

                    {result.success && (
                      <p className="text-xs text-green-700 mt-3">
                        Đang chuyển về trang quản lý...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-2">📖 Hướng dẫn:</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>File JSON phải có cấu trúc: <code className="text-xs bg-gray-200 px-1 rounded">{`{ "legalLibraryItems": [...], "procedures": [...] }`}</code></li>
                <li>Các văn bản/thủ tục đã tồn tại (trùng title) sẽ bị bỏ qua</li>
                <li>File mẫu: <code className="text-xs bg-gray-200 px-1 rounded">data/legal-library.json</code></li>
                <li>Hỗ trợ import cả documents và procedures cùng lúc</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
