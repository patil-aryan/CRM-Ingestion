import type { SlackFile } from "@/types/slack"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileIcon, FileTextIcon, ImageIcon, VideoIcon } from "lucide-react"
import { formatTimestamp } from "@/lib/utils"

interface FileListProps {
  files: SlackFile[]
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No files in this channel yet.</div>
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image")) return <ImageIcon className="h-4 w-4" />
    if (fileType.startsWith("video")) return <VideoIcon className="h-4 w-4" />
    if (fileType.startsWith("text") || fileType.includes("document")) return <FileTextIcon className="h-4 w-4" />
    return <FileIcon className="h-4 w-4" />
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>Shared By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.fileId}>
                <TableCell>{getFileIcon(file.fileType)}</TableCell>
                <TableCell className="font-medium">{file.fileName}</TableCell>
                <TableCell>{file.fileType}</TableCell>
                <TableCell>{file.userName}</TableCell>
                <TableCell>{formatTimestamp(file.timestamp)}</TableCell>
                <TableCell className="text-right">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

