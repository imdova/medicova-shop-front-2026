"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/UI/select";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Code,
  Quote,
  Table,
  Eye,
  EyeOff,
  Plus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";

// ✅ Toolbar Button Component
function ToolbarButton({
  onClick,
  title,
  children,
  active = false,
  disabled = false,
}: {
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md border transition-all ${
        active
          ? "border-green-500 bg-green-50 text-green-600"
          : "border-transparent hover:border-gray-300 hover:bg-gray-100"
      } ${disabled ? "cursor-not-allowed opacity-50" : "active:scale-95"}`}
    >
      {children}
    </button>
  );
}

// ✅ UI Blocks Dialog - FIXED
function UIBlocksDialog({
  onInsertBlock,
}: {
  onInsertBlock: (block: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  const blocks = [
    {
      id: "about",
      name: "About Section",
      category: "content",
      code: `[about-section title="About Us" description="Add your about content here"]`,
      description: "About section with title and description",
    },
    {
      id: "ads",
      name: "Ads Banner",
      category: "marketing",
      code: `[ads placement="sidebar" size="medium"]`,
      description: "Advertising banner placement",
    },
    {
      id: "app-downloads",
      name: "App Downloads",
      category: "marketing",
      code: `[app-downloads platform="both" android_url="#" ios_url="#"]`,
      description: "Mobile app download buttons",
    },
    {
      id: "audio",
      name: "Audio Player",
      category: "media",
      code: `[audio src="audio-file.mp3" title="Audio Title" autoplay="no"]`,
      description: "Embedded audio player",
    },
    {
      id: "ecommerce-collections",
      name: "Ecommerce Collections",
      category: "ecommerce",
      code: `[ecommerce-collections items_per_view="5" autoplay="no" autoplay_speed="2000" loop="yes"]`,
      description: "Product collections carousel",
    },
    {
      id: "image-gallery",
      name: "Image Gallery",
      category: "media",
      code: `[gallery columns="3" images="image1.jpg,image2.jpg,image3.jpg"]`,
      description: "Responsive image gallery grid",
    },
    {
      id: "testimonials",
      name: "Testimonials",
      category: "content",
      code: `[testimonials style="carousel" autoplay="yes"]`,
      description: "Customer testimonials slider",
    },
    {
      id: "contact-form",
      name: "Contact Form",
      category: "forms",
      code: `[contact-form fields="name,email,message"]`,
      description: "Contact form with customizable fields",
    },
  ];

  const categories = [
    { id: "all", name: "All Blocks" },
    { id: "content", name: "Content" },
    { id: "media", name: "Media" },
    { id: "ecommerce", name: "Ecommerce" },
    { id: "marketing", name: "Marketing" },
    { id: "forms", name: "Forms" },
  ];

  const filteredBlocks = blocks.filter(
    (block) =>
      block.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === "all" || block.category === selectedCategory),
  );

  const handleInsert = (blockCode: string) => {
    console.log("Inserting block:", blockCode);
    onInsertBlock(blockCode);
    setIsOpen(false);
    setSearch("");
    setSelectedCategory("all");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus size={16} />
          UI Blocks
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] min-w-[240px] flex-col overflow-hidden sm:min-w-[400px] lg:min-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            UI Blocks
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden overflow-y-auto lg:flex-row">
          {/* Categories Sidebar */}
          <div className="flex flex-col border-r pr-3 lg:w-40">
            <div className="relative mb-3">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search blocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    selectedCategory === category.id
                      ? "bg-green-500 font-medium text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Blocks Grid */}
          <div className="flex flex-1 flex-col">
            <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-2">
              {filteredBlocks.map((block) => (
                <div
                  key={block.id}
                  className="h-[300px] w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-green-300 hover:shadow-md"
                  onClick={() => handleInsert(block.code)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="font-semibold text-gray-800">
                      {block.name}
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        block.category === "ecommerce"
                          ? "bg-purple-100 text-purple-800"
                          : block.category === "media"
                            ? "bg-green-100 text-green-800"
                            : block.category === "marketing"
                              ? "bg-orange-100 text-orange-800"
                              : block.category === "forms"
                                ? "bg-pink-100 text-pink-800"
                                : "bg-green-100 text-green-800"
                      }`}
                    >
                      {block.category}
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    {block.description}
                  </div>
                  <div className="rounded border bg-gray-50 p-2 font-mono text-xs text-gray-500">
                    {block.code}
                  </div>
                </div>
              ))}

              {filteredBlocks.length === 0 && (
                <div className="col-span-2 py-8 text-center text-gray-500">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  <div>No blocks found</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            {filteredBlocks.length} blocks found
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ✅ Media Dialog
function MediaDialog({
  onInsertMedia,
}: {
  onInsertMedia: (url: string, alt?: string) => void;
}) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleInsert = () => {
    if (mediaUrl.trim()) {
      onInsertMedia(mediaUrl.trim(), altText.trim());
      setIsOpen(false);
      setMediaUrl("");
      setAltText("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Image size={16} />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Media URL</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Alt Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Description for accessibility"
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!mediaUrl.trim()}>
            Insert Media
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: "en" | "ar";
  showEditor?: boolean;
  onToggleEditor?: (visible: boolean) => void;
  forPage?: boolean;
}

export default function TextEditor({
  value,
  onChange,
  language = "en",
  showEditor = true,
  onToggleEditor,
  forPage = false,
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");
  const [htmlValue, setHtmlValue] = useState(value || "");
  const [isEditorVisible, setIsEditorVisible] = useState(showEditor);

  const t = {
    en: {
      show_editor: "Show Editor",
      hide_editor: "Hide Editor",
      visual: "Visual",
      html: "HTML",
      bold: "Bold",
      italic: "Italic",
      underline: "Underline",
      strikethrough: "Strikethrough",
      bullet_list: "Bullet List",
      numbered_list: "Numbered List",
      link: "Insert Link",
      undo: "Undo",
      redo: "Redo",
      paragraph: "Paragraph",
      heading_1: "Heading 1",
      heading_2: "Heading 2",
      heading_3: "Heading 3",
      align_left: "Align Left",
      align_center: "Align Center",
      align_right: "Align Right",
      align_justify: "Align Justify",
      insert_image: "Insert Image",
      blockquote: "Blockquote",
      code: "Code Block",
      table: "Insert Table",
      add_media: "Add Media",
      ui_blocks: "UI Blocks",
    },
    ar: {
      show_editor: "إظهار المحرر",
      hide_editor: "إخفاء المحرر",
      visual: "مرئي",
      html: "HTML",
      bold: "عريض",
      italic: "مائل",
      underline: "تحته خط",
      strikethrough: "خط في المنتصف",
      bullet_list: "قائمة نقطية",
      numbered_list: "قائمة رقمية",
      link: "إدراج رابط",
      undo: "تراجع",
      redo: "إعادة",
      paragraph: "فقرة",
      heading_1: "عنوان 1",
      heading_2: "عنوان 2",
      heading_3: "عنوان 3",
      align_left: "محاذاة لليسار",
      align_center: "محاذاة للوسط",
      align_right: "محاذاة لليمين",
      align_justify: "محاذاة كاملة",
      insert_image: "إدراج صورة",
      blockquote: "اقتباس",
      code: "كود بلوك",
      table: "إدراج جدول",
      add_media: "إضافة وسائط",
      ui_blocks: "كتل واجهة المستخدم",
    },
  }[language];

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && activeTab === "visual") {
      if (htmlValue) {
        editorRef.current.innerHTML = htmlValue;
      } else {
        editorRef.current.innerHTML = "<p><br></p>";
      }
    }
  }, [activeTab, htmlValue]);

  // Sync value changes
  useEffect(() => {
    setHtmlValue(value || "");
  }, [value]);

  const toggleEditorVisibility = () => {
    const newVisibility = !isEditorVisible;
    setIsEditorVisible(newVisibility);
    onToggleEditor?.(newVisibility);
  };

  // ✅ FIXED: Simple and reliable execCommand
  const execCommand = (cmd: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, value);
      handleChange();
    }
  };

  const handleChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlValue(html);
      onChange(html);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // ✅ FIXED: Simple image insertion
  const insertImage = (url: string, alt?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const img = `<img src="${url}" alt="${alt || ""}" style="max-width:100%; height:auto; margin:10px 0;" />`;
      document.execCommand("insertHTML", false, img);
      handleChange();
    }
  };

  // ✅ FIXED: Working block insertion - SIMPLE AND RELIABLE
  const insertBlock = (blockCode: string) => {
    if (editorRef.current) {
      // Focus the editor
      editorRef.current.focus();

      // Create simple visible block
      const blockHTML = `
        <div style="
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
          font-family: system-ui;
          color: #0369a1;
          font-size: 14px;
        ">
          <div style="font-weight: bold; margin-bottom: 8px; font-size: 12px; text-transform: uppercase;">
            🧩 UI Block
          </div>
          <div style="font-family: 'Courier New', monospace; background: white; padding: 8px; border-radius: 4px;">
            ${blockCode}
          </div>
        </div>
      `;

      // Use insertHTML command
      document.execCommand("insertHTML", false, blockHTML);

      // Force change detection
      handleChange();

      console.log("Block inserted successfully:", blockCode);
    }
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #f8f9fa;">
          <th style="border: 1px solid #ddd; padding: 8px;">Header 1</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Header 2</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Header 3</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Data 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Data 2</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Data 3</td>
        </tr>
      </table>
    `;
    execCommand("insertHTML", tableHTML);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setHtmlValue(newValue);
    onChange(newValue);
  };

  const handleTabSwitch = (tab: "visual" | "html") => {
    setActiveTab(tab);
  };

  // Show only toggle button when editor is hidden
  if (!isEditorVisible) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <Button
          onClick={toggleEditorVisibility}
          variant="outline"
          className="gap-2"
        >
          <Eye size={16} />
          {t.show_editor}
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <Button
          onClick={toggleEditorVisibility}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <EyeOff size={16} />
          {t.hide_editor}
        </Button>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          <Button
            variant={activeTab === "visual" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabSwitch("visual")}
          >
            {t.visual}
          </Button>
          <Button
            variant={activeTab === "html" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabSwitch("html")}
          >
            {t.html}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand("bold")} title={t.bold}>
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("italic")}
              title={t.italic}
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("underline")}
              title={t.underline}
            >
              <Underline size={16} />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => execCommand("insertUnorderedList")}
              title={t.bullet_list}
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("insertOrderedList")}
              title={t.numbered_list}
            >
              <ListOrdered size={16} />
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => execCommand("justifyLeft")}
              title={t.align_left}
            >
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("justifyCenter")}
              title={t.align_center}
            >
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("justifyRight")}
              title={t.align_right}
            >
              <AlignRight size={16} />
            </ToolbarButton>
          </div>

          {/* Advanced Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => execCommand("formatBlock", "blockquote")}
              title={t.blockquote}
            >
              <Quote size={16} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => execCommand("formatBlock", "pre")}
              title={t.code}
            >
              <Code size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={insertTable} title={t.table}>
              <Table size={16} />
            </ToolbarButton>
          </div>

          {/* Link */}
          <ToolbarButton onClick={insertLink} title={t.link}>
            <LinkIcon size={16} />
          </ToolbarButton>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand("undo")} title={t.undo}>
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand("redo")} title={t.redo}>
              <Redo size={16} />
            </ToolbarButton>
          </div>

          {/* Headings Selector */}
          <div>
            <Select
              onValueChange={(val) => execCommand("formatBlock", val)}
              defaultValue="p"
            >
              <SelectTrigger className="h-8 w-28 text-sm">
                <SelectValue placeholder={t.paragraph} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">{t.paragraph}</SelectItem>
                <SelectItem value="h1">{t.heading_1}</SelectItem>
                <SelectItem value="h2">{t.heading_2}</SelectItem>
                <SelectItem value="h3">{t.heading_3}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media & Blocks */}
          <div className="flex items-center gap-2 border-l pl-2">
            <MediaDialog onInsertMedia={insertImage} />
            {forPage && <UIBlocksDialog onInsertBlock={insertBlock} />}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="min-h-64 bg-white">
        {activeTab === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleChange}
            className="min-h-64 w-full p-4 outline-none"
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              fontFamily: "system-ui",
              lineHeight: "1.6",
              direction: language === "ar" ? "rtl" : "ltr",
              textAlign: language === "ar" ? "right" : "left",
              minHeight: "256px",
            }}
          />
        ) : (
          <textarea
            value={htmlValue}
            onChange={handleHtmlChange}
            className="min-h-64 w-full resize-none border-0 p-4 font-mono text-sm outline-none"
            style={{ minHeight: "256px" }}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
        )}
      </div>

      {/* Simple CSS Styles */}
      <style jsx global>{`
        [contenteditable]:focus {
          outline: none;
        }

        .ui-block {
          background: #f0f9ff !important;
          border: 2px solid #0ea5e9 !important;
          border-radius: 8px !important;
          padding: 16px !important;
          margin: 12px 0 !important;
          color: #0369a1 !important;
        }
      `}</style>
    </div>
  );
}
