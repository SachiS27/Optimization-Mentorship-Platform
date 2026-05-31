import { useState, useRef } from 'react'

export default function DropZone({ file, onFileChange, accept }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      onFileChange(droppedFile)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      onFileChange(selected)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
            : file
            ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          accept={accept}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">📎</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[250px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {formatSize(file.size)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
              }}
              className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <p className="text-3xl mb-2">{isDragging ? '📥' : '📁'}</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              or click to browse
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
