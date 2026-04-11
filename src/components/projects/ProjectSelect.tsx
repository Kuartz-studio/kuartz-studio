"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, FolderKanban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ProjectTag } from "./ProjectTag";
import { buttonVariants } from "@/components/ui/button";

export type ProjectRecord = {
  id: string;
  name: string;
  logoBase64?: string | null;
  slug?: string;
};

type Props = 
  | { multiple?: false; value: string | null; onChange: (val: string | null) => void; projects: ProjectRecord[]; placeholder?: string; className?: string; }
  | { multiple: true; value: string[]; onChange: (val: string[]) => void; projects: ProjectRecord[]; placeholder?: string; className?: string; };

export function ProjectSelect(props: Props) {
  const [open, setOpen] = useState(false);

  const { projects, placeholder = "Sélectionner un projet...", className, multiple } = props;

  // Single mode
  if (!multiple) {
    const value = props.value as string | null;
    const onChange = props.onChange as (val: string | null) => void;
    const selected = projects.find(p => p.id === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger 
          role="combobox"
          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between h-auto py-1.5 px-3 min-h-[38px] bg-transparent border-dashed font-normal whitespace-pre-wrap leading-tight text-left", className)}
        >
            {selected ? (
              <ProjectTag name={selected.name} logoBase64={selected.logoBase64} className="border-none bg-transparent px-0 py-0 text-left" />
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un projet..." />
            <CommandList>
              <CommandEmpty>Aucun projet trouvé.</CommandEmpty>
              <CommandGroup>
                {/* Option to deselect */}
                {value && (
                  <CommandItem
                    value="_none"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="text-muted-foreground italic text-xs"
                  >
                    Aucun projet
                  </CommandItem>
                )}
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => {
                      onChange(project.id === value ? null : project.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {project.logoBase64 ? (
                        <img src={project.logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                      ) : (
                        <FolderKanban size={12} className="opacity-50 shrink-0" />
                      )}
                      <span className="truncate text-sm">{project.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === project.id ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Multiple mode
  const value = props.value as string[];
  const onChange = props.onChange as (val: string[]) => void;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger 
        role="combobox"
        className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between h-auto py-1.5 px-3 min-h-[38px] bg-transparent border-dashed font-normal whitespace-pre-wrap leading-tight text-left", className)}
      >
          <div className="flex flex-wrap gap-1 items-center flex-1">
            {value.length > 0 ? (
              value.map(id => {
                const p = projects.find(x => x.id === id);
                if (!p) return null;
                return <ProjectTag key={p.id} name={p.name} logoBase64={p.logoBase64} />;
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un projet..." />
          <CommandList>
            <CommandEmpty>Aucun projet trouvé.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => {
                const isSelected = value.includes(project.id);
                return (
                  <CommandItem
                    key={project.id}
                    value={project.name}
                    onSelect={() => {
                      if (isSelected) {
                        onChange(value.filter(id => id !== project.id));
                      } else {
                        onChange([...value, project.id]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {project.logoBase64 ? (
                        <img src={project.logoBase64} alt="" className="h-4 w-4 rounded-full object-cover shrink-0" />
                      ) : (
                        <FolderKanban size={12} className="opacity-50 shrink-0" />
                      )}
                      <span className="truncate text-sm">{project.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        isSelected ? "opacity-100 text-primary" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
