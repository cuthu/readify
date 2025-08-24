import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function App() {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="font-headline text-lg">Readify</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* Placeholder for future sidebar items */}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <main className="p-4">
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="text-to-speech">
                  <FileText className="mr-2 h-4 w-4" />
                  Text to Speech
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>Upload a .pdf or .docx file to get started.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 text-center transition-colors hover:border-primary">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <p>Click to browse or drag & drop</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="text-to-speech">
                <Card>
                  <CardHeader>
                    <CardTitle>Text to Speech</CardTitle>
                    <CardDescription>Paste text below and generate audio.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Paste your text here..." rows={10} />
                    <Button>Generate Audio</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}