/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  Hash, 
  Clock,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "mymemo.notes";

// --- Seed Data ---
const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "디자인 시스템을 준수하여 일관된 UI 요소를 배치합니다. 여백과 그리드 시스템을 확인하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "사피엔스, 클린 코드, 생각에 관한 생각. 이번 달 안으로 최소 두 권 읽기.",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "로컬 스토리지를 활용한 초경량 메모 앱 만들기. 태그 기반 필터링과 실시간 검색이 핵심.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  // --- States ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTags, setFormTags] = useState("");

  // --- Effects ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        setNotes(INITIAL_NOTES);
      }
    } else {
      setNotes(INITIAL_NOTES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
    }
  }, []);

  const saveToStorage = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
  };

  // --- Computed Values ---
  const allTags = useMemo(() => {
    const tagsMap: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagsMap[tag] = (tagsMap[tag] || 0) + 1;
      });
    });
    return Object.entries(tagsMap).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(query) || 
        note.body.toLowerCase().includes(query) || 
        note.tags.some(t => t.toLowerCase().includes(query));
      return matchesTag && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, searchQuery]);

  // --- Handlers ---
  const handleAddNote = () => {
    if (!formTitle.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: formTitle,
      body: formBody,
      tags: formTags.split(',').map(t => t.trim()).filter(t => t !== ""),
      updatedAt: new Date().toISOString(),
    };

    saveToStorage([newNote, ...notes]);
    closeModal();
  };

  const handleDeleteNote = (id: number) => {
    if (confirm("이 메모를 삭제하시겠습니까?")) {
      const newNotes = notes.filter(note => note.id !== id);
      saveToStorage(newNotes);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormTitle("");
    setFormBody("");
    setFormTags("");
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-indigo-200 shadow-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">MyMemo</h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="제목, 내용, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-200 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>새 메모</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0 space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-3">필터</h2>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${!selectedTag ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <span>전체</span>
                </div>
                <span className="text-xs opacity-60">{notes.length}</span>
              </button>
              {allTags.map(([tag, count]) => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedTag === tag ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    <span className="truncate">{tag}</span>
                  </div>
                  <span className="text-xs opacity-60">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div 
                    layout
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col h-full"
                  >
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <h3 className="font-bold text-slate-800 text-lg truncate pr-8">{note.title}</h3>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-4 flex-1">
                      {note.body}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold rounded-md flex items-center gap-1 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <TagIcon className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{formatDate(note.updatedAt)}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
              <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">검색 결과가 없거나 메모가 비어 있습니다.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-800">새 메모 작성</h2>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">제목</label>
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="메모의 제목을 입력하세요"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1">본문</label>
                    <textarea 
                      placeholder="내용을 자유롭게 적어주세요..."
                      rows={6}
                      value={formBody}
                      onChange={(e) => setFormBody(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase px-1 underline decoration-slate-200 flex items-center gap-2">
                       태그 <span className="normal-case font-normal text-slate-400">(쉼표로 구분)</span>
                    </label>
                    <div className="relative">
                      <TagIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="예: 업무, 디자인, 개발"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={closeModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleAddNote}
                    disabled={!formTitle.trim()}
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    저장하기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
