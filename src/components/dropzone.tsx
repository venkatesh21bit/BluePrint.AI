"use client";
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions, DropzoneState, FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, File, Loader2, Upload, X } from 'lucide-react';

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB'
) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (size) {
    const i = sizes.indexOf(size);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

type DropzoneContextType = DropzoneState & {
  maxFiles?: number;
  maxSize?: number;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isUploading: boolean;
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined);

export const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }
  return context;
};

interface DropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  className?: string;
  children: React.ReactNode;
  onFilesChanged?: (files: File[]) => void;
  isUploading?: boolean;
}

export function Dropzone({
  className,
  children,
  onFilesChanged,
  isUploading = false,
  ...options
}: DropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setFiles((prev) => {
        const newFiles = [...prev, ...acceptedFiles];
        if (options.maxFiles && newFiles.length > options.maxFiles) {
          return newFiles.slice(0, options.maxFiles);
        }
        return newFiles;
      });

      if (onFilesChanged) {
        onFilesChanged(acceptedFiles);
      }
    },
    [onFilesChanged, options.maxFiles]
  );

  const dropzoneState = useDropzone({
    onDrop: handleDrop,
    ...options,
  });

  return (
    <DropzoneContext.Provider
      value={{
        ...dropzoneState,
        maxFiles: options.maxFiles,
        maxSize: options.maxSize,
        files,
        setFiles,
        isUploading,
      }}
    >
      <div
        {...dropzoneState.getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors bg-card hover:bg-muted/50',
          dropzoneState.isDragActive && 'border-primary bg-primary/5',
          dropzoneState.isDragReject && 'border-destructive bg-destructive/10',
          className
        )}
      >
        <input {...dropzoneState.getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
}

export function DropzoneEmptyState({ className }: { className?: string }) {
  const { files, isDragActive, maxSize, maxFiles } = useDropzoneContext();

  if (files.length > 0) return null;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 text-center text-sm', className)}>
      <Upload className="w-10 h-10 text-muted-foreground mb-2" />
      {isDragActive ? (
        <p className="font-medium text-primary">Drop files here...</p>
      ) : (
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
        </p>
      )}
      <div className="text-xs text-muted-foreground">
        {maxFiles && <p>Up to {maxFiles} files</p>}
        {maxSize && <p>Max size: {formatBytes(maxSize)}</p>}
      </div>
    </div>
  );
}

export function DropzoneContent({ className }: { className?: string }) {
  const { files, setFiles, isUploading } = useDropzoneContext();

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent opening file dialog
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (files.length === 0) return null;

  return (
    <div className={cn('w-full mt-4 space-y-2', className)}>
      {files.map((file, i) => (
        <div
          key={`${file.name}-${i}`}
          className="flex items-center justify-between p-3 border rounded-md bg-background/50"
          onClick={(e) => e.stopPropagation()} // Prevent opening file dialog
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <File className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {isUploading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => removeFile(e, i)}
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
