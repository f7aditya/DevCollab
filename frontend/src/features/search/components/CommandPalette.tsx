"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { globalSearch, SearchResult } from "@/features/search/api/searchApi";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Folder, CheckCircle2, FileText, User, ArrowRight } from "lucide-react";

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (val: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch results
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["globalSearch", debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "PROJECT": return <Folder className="h-4 w-4 text-blue-500" />;
      case "TASK": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "POST": return <FileText className="h-4 w-4 text-orange-500" />;
      case "USER": return <User className="h-4 w-4 text-purple-500" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const handleSelect = (link: string) => {
    setOpen(false);
    router.push(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-border/50 shadow-2xl w-full">
        <div className="flex items-center px-4 py-4 border-b border-border bg-surface/30">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <Input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-base"
          />
          <div className="text-[10px] font-semibold text-muted-foreground bg-surface-hover px-1.5 py-0.5 rounded ml-2">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Type at least 2 characters to search across projects, tasks, posts, and users.
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {['PROJECT', 'TASK', 'POST', 'USER'].map((type) => {
                const groupResults = results.filter(r => r.type === type);
                if (groupResults.length === 0) return null;

                return (
                  <div key={type} className="mb-4">
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                      {type}s
                    </div>
                    {groupResults.map((result) => (
                      <div 
                        key={result.id}
                        onClick={() => handleSelect(result.link)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover cursor-pointer group transition-colors"
                      >
                        <div className="bg-surface p-1.5 rounded-md group-hover:bg-background border border-transparent group-hover:border-border/50">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{result.title}</h4>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
